document.addEventListener('DOMContentLoaded', async function() {
    const userTable = document.querySelector('.user-table tbody');
    const totalUser = document.querySelector('.total-users-number');
    const userList = document.querySelector('.user-table tbody');
    let user = '';
    let count = 1;

    try {
        const response = await fetch('http://localhost:3000/admin/getUser');
        const data = await response.json();
        console.log('response.ok ' + response.ok);
        console.log('users.success '+ data.success);
        console.log('users '+ data);
        // data.users.forEach(e => console.log(e));

        if (!response.ok || !data.success) {
            throw new Error(data.error);
        }

        totalUser.textContent = data.users.length - 1;

        data.users.forEach((element, i) => {
            if (element.active === 'true') {
                 user += `
                        <tr>
                            <td>${count++}</td>
                            <td>${element.name}</td>
                            <td>${element.email}</td>
                            <td class="status-active">Active</td>
                            <td><button class="action-btn deactivate-btn">Deactivate</button></td>
                        </tr>
                        `
            }
            else if (element.active === 'false') {
                user += `
                        <tr>
                            <td>${count++}</td>
                            <td>${element.name}</td>
                            <td>${element.email}</td>
                            <td class="status-inactive">Inactive</td>
                            <td><button class="action-btn activate-btn">Activate</button></td>
                        </tr>
                        `
            }
        });
        // console.log(user);
        userList.innerHTML = user;
    }
    catch (err) {
        console.error(err.message);
    }

    if (userTable) {
        userTable.addEventListener('click', async function(event) {
            const target = event.target;

            // Check if the clicked element is an action button
            if (target.classList.contains('action-btn')) {
                const row = target.closest('tr'); // Get the parent table row
                if (!row) return;

                const statusCell = row.querySelector('td:nth-child(4)'); // The 4th cell is the Status cell
                const name = row.querySelector('td:nth-child(2)').textContent;
                
                if (target.classList.contains('deactivate-btn')) {
                    try {
                        console.log('name ', name);
                        const response = await fetch('http://localhost:3000/admin/changeStatus', {
                            method: 'PUT',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({username: name, active: false})
                        });
                        const data = await response.json();
                        if (!response.ok || !data.success) {
                            throw new Error(data.error);
                        }
                    }
                    catch (err) {
                        return console.error('Failed to change status', err.message);
                    }
                    // Current status is Active, change to Inactive
                    statusCell.textContent = 'Inactive';
                    statusCell.classList.remove('status-active');
                    statusCell.classList.add('status-inactive');
                    
                    target.textContent = 'Activate';
                    target.classList.remove('deactivate-btn');
                    target.classList.add('activate-btn');
                } else if (target.classList.contains('activate-btn')) {
                    try {
                        console.log('name ', name);
                        const response = await fetch('http://localhost:3000/admin/changeStatus', {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({username: name, active: true})
                        });
                        const data = await response.json();
                        if (!response.ok || !data.success) {
                            throw new Error(data.error);
                        }
                    }
                    catch (err) {
                        return console.error('Failed to change status', err.message);
                    }
                    // Current status is Inactive, change to Active
                    statusCell.textContent = 'Active';
                    statusCell.classList.remove('status-inactive');
                    statusCell.classList.add('status-active');

                    target.textContent = 'Deactivate';
                    target.classList.remove('activate-btn');
                    target.classList.add('deactivate-btn');
                }
            }
        });
    }
});
