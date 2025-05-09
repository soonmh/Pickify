document.addEventListener('DOMContentLoaded', function() {
    const userTable = document.querySelector('.user-table tbody');

    if (userTable) {
        userTable.addEventListener('click', function(event) {
            const target = event.target;

            // Check if the clicked element is an action button
            if (target.classList.contains('action-btn')) {
                const row = target.closest('tr'); // Get the parent table row
                if (!row) return;

                const statusCell = row.querySelector('td:nth-child(4)'); // The 4th cell is the Status cell
                
                if (target.classList.contains('deactivate-btn')) {
                    // Current status is Active, change to Inactive
                    statusCell.textContent = 'Inactive';
                    statusCell.classList.remove('status-active');
                    statusCell.classList.add('status-inactive');
                    
                    target.textContent = 'Activate';
                    target.classList.remove('deactivate-btn');
                    target.classList.add('activate-btn');
                } else if (target.classList.contains('activate-btn')) {
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
