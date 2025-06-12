const isLoggedIn = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser');
var userObj;
var userId;
var allCollectionName=[];
var currentCollectionName="";
var currentCollectionDescription="";
var currentCollectionItem=[];
const watchlistPage = document.querySelector(".content-inner");
const addListPage = document.querySelector(".add-collection-container");
const collectionPage = document.querySelector(".collectionPage");
// const collectionType = document.querySelectorAll(".collectionType");
const editListPage = document.querySelector(".editWatchlistPage");
const createCollection = document.querySelector(".create-btn");
const loadingScreen = document.getElementById('loadingScreen');
const requestLogin = document.getElementById('requestLogin');
const nothingInside = document.getElementById("nothingInside");

document.addEventListener("DOMContentLoaded", function(){
    checkUserLogin();
    buttonCreation();
    addSideBarEvent();
    addListButtonEvent();
    editListButtonEvent();
    countingWordEvent();
    // testingFunction();
})

// function testingFunction(){
//     const currentUserId = userId;
//     const collectionName = 'Watch Later';
//     const itemId = '3siw6WPG2jmb6xLleIe39c';
//     const type = 'music';
//     addItemFunction(currentUserId,collectionName,itemId,type);
// }

//Useless for now
function getCollectionType(collection){
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function updatePageUrl(collectionName){
    const url = new URL(window.location);
    url.searchParams.set('collection',collectionName);
    window.history.replaceState({},'',url);
}

function checkUserLogin(){
    if(isLoggedIn){
        userObj = JSON.parse(isLoggedIn);
        userId=userObj.userId;
    }
}

async function buttonCreation(){
    const myListNav = document.querySelector(".my-lists-nav");
    myListNav.innerHTML="";
    if(userId){
        // const userObj = JSON.parse(isLoggedIn);
        // const userId=userObj.userId;
        // console.log(userId);
        try {
            
            const response = await fetch(
                `http://localhost:3000/collectionNameList?userId=${userId}`
            );
            // console.log(`${encodeURIComponent(collectionName)}`);

            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }

            const data = await response.json();
            data.forEach(collectionName => {
                allCollectionName.push(collectionName);
                if(collectionName=='Favourite'||collectionName=='Watch Later'){
                    return;
                }
                // console.log(collectionName);
                const aLink=document.createElement("a");
                aLink.className="collectionType";
                aLink.textContent=collectionName;
                
                myListNav.appendChild(aLink);
            });



        } catch (error) {
            console.error('Error fetching collection movies:', error);
        }
    }
}

function addSideBarEvent(){
    document.querySelector('.sidebar').addEventListener('click', async function (e) {
        const link = e.target.closest('.collectionType');

        if (!link) return;

        watchlistPage.style.display = "none";
        addListPage.style.display = "none";
        collectionPage.style.display = "none";
        editListPage.style.display = "none";
        requestLogin.style.display = "none";
        nothingInside.style.display = "none";
        await loadingScreenPage();

        let clickedText = link.textContent.trim();
        currentCollectionName=clickedText;
        let text = clickedText.toLowerCase().trim();
        updatePageUrl(text);

        console.log(isLoggedIn);
        // let userObj;
        // console.log(userObj);
        if (userId) {
            // userObj = JSON.parse(isLoggedIn);
            updateContent(clickedText);
        } else {
            loadingScreen.style.display = 'none';
            requestLogin.style.display = 'block';
            console.log("No user is logged in.");
        }

        console.log("Displaying collection:", clickedText);
    });
}

function addListButtonEvent(){
    const createButton = document.getElementById("create-list-button");
    createButton.addEventListener("click", async function(){
        const collectionName = document.querySelector(".collection-name").value.trim();
        const collectionDescription = document.querySelector(".collection-description").value.trim();
        
        if(collectionName.length==0){
            alert("Please enter a collection name.")
            return;
        }
        if(!checkDuplicateName(collectionName)){
            alert("Collection existed. Please enter a different collection name.")
            return;
        }

        await fetch('http://localhost:3000/createCollection', {
        method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                collectionName,
                collectionDescription
            })
        });

        console.log(`${collectionName}  ${collectionDescription}`);
        reloadAndNavigate(collectionName)
        // await loadingScreenPage();

    });
}


const nameTextAreas = document.querySelectorAll(".collection-name");
const descriptionTextAreas = document.querySelectorAll(".collection-description");
const nameCharCounts = document.querySelectorAll(".name-char-count");
const descCharCounts = document.querySelectorAll(".desc-char-count");

function editListButtonEvent(){
    const nameTextArea = editListPage.querySelector(".collection-name");
    const descriptionTextArea = editListPage.querySelector(".collection-description");
    const nameCharCount = editListPage.querySelector(".name-char-count");
    const descCharCount = editListPage.querySelector(".desc-char-count");
    const infoText = document.getElementsByClassName("info-text");
    const deleteCollectionButton = editListPage.querySelector(".delete-watchlist-btn");
    const editButton=document.getElementById("edit-btn");
    editButton.addEventListener("click", async function(){
        collectionPage.style.display = "none";
        // infoText.style.display = "none";
        await loadingScreenPage();
        loadingScreen.style.display="none";
        editListPage.style.display = "flex";
        nameTextArea.value=currentCollectionName;
        descriptionTextArea.value=currentCollectionDescription;
        nameCharCount.textContent=`${nameTextArea.value.length}/30`;
        descCharCount.textContent=`${descriptionTextArea.value.length}/110`;
        if(currentCollectionName=="Favourite"||currentCollectionName=="Watch Later"){
            for (let i = 0; i < infoText.length; i++) {
                infoText[i].style.display = "block";
            }
            nameTextArea.readOnly = true;
            descriptionTextArea.readOnly = true;
            deleteCollectionButton.style.display="none";
            // deleteCollectionButtonEvent(deleteCollectionButton);
        }else{
            for (let i = 0; i < infoText.length; i++) {
                infoText[i].style.display = "none";
            }
            nameTextArea.readOnly = false;
            descriptionTextArea.readOnly = false;
            deleteCollectionButton.style.display="block";
            deleteCollectionButtonEvent(deleteCollectionButton);
        }
        updateMovieInEditPage();
        const removeMovieButtons=editListPage.querySelectorAll(".remove-movie-btn");
        removeMovieButtons.forEach(removeMovieButton => {
            removeMovieButton.onclick = () => {
                if(removeMovieButton.textContent=="Remove"){
                    removeMovieButton.textContent="Removed";
                }else{
                    removeMovieButton.textContent="Remove";
                }
            }
        });
        const saveChangeButton=editListPage.querySelector(".save-changes-btn");
        saveChangeButton.onclick = async () => {
            let nameTextAreaValue=nameTextArea.value.trim();
            let descriptionTextAreaValue=descriptionTextArea.value.trim();
            // console.log(nameTextAreaValue);
            // console.log(descriptionTextAreaValue);
            let listToRemove=[]
            const moviesListContainer=editListPage.querySelector(".movies-list-container");
            if (moviesListContainer.children.length !== 0) {
                const movieItems = editListPage.querySelectorAll(".movie-item");
                let index=0;
                movieItems.forEach((movieItem)=>{
                    const removeMovieButton = movieItem.querySelector(".remove-movie-btn");
                    if(removeMovieButton.textContent==="Removed"){
                        listToRemove.push(currentCollectionItem[index].objId);
                    }
                    index++;
                });
            }
            allCollectionName = allCollectionName.filter(name => name !== currentCollectionName);
            if(!checkDuplicateName(nameTextAreaValue)){
                alert("Collection existed. Please enter a different collection name.")
                return;
            }
            await saveChangeFunction(nameTextAreaValue,descriptionTextAreaValue,listToRemove);
        }
        // console.log(currentCollectionItem);
    });
}

function deleteCollectionButtonEvent(deleteCollectionButton){
    const deletionComfirmPage=document.querySelector(".deletionComfirmPage");
    deleteCollectionButton.addEventListener('click', () => {
        deletionComfirmPage.style.display="flex";
        const buttonCancel=deletionComfirmPage.querySelector(".cancel-btn");
        const buttonDelete=deletionComfirmPage.querySelector(".delete-btn");
        buttonCancel.onclick = () => {
            deletionComfirmPage.style.display = "none";
        };

        buttonDelete.onclick = async () => {
            await collectionDeletion();
        };
    });
}

async function collectionDeletion(){
    console.log(userId);
    console.log(currentCollectionName);
    try {
        const response = await fetch(
            `http://localhost:3000/deleteCollection?userId=${userId}&currentCollectionName=${encodeURIComponent(currentCollectionName)}`,
            {
                method: 'DELETE'
            }
        );

        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }

        const result = await response.json();
        console.log('Delete result:', result);

        if (result.success) {
            alert('Collection deleted successfully.');
            window.location.href = 'watchlist.html';
        } else {
            alert(result.message || 'Failed to delete the collection.');
        }

    } catch (error) {
        console.error('Error deleting collection:', error);
    }
}

async function saveChangeFunction(nameTextAreaValue,descriptionTextAreaValue,listToRemove){
    try {
        const response = await fetch(
            `http://localhost:3000/editCollection?userId=${userId}&currentCollectionName=${encodeURIComponent(currentCollectionName)}&nameTextAreaValue=${nameTextAreaValue}&descriptionTextAreaValue=${descriptionTextAreaValue}&listToRemove=${encodeURIComponent(JSON.stringify(listToRemove))}`,
            {
                method: 'DELETE'
            }
        );

        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }

        const result = await response.json();
        // console.log('Delete result:', result);

        if (result.success) {
            alert('Collection edit successfully.');
            editListPage.style.display="none";
            await loadingScreenPage();
            window.location.href = 'watchlist.html';
        } else {
            alert(result.message || 'Failed to edit the collection.');
        }

    } catch (error) {
        console.error('Error editing collection:', error);
    }
}

function updateMovieInEditPage(){
    const moviesListContainer = editListPage.querySelector(".movies-list-container");
    moviesListContainer.innerHTML="";
    if(currentCollectionItem && currentCollectionItem.length > 0){
        currentCollectionItem.forEach(item => {
            // console.log(item);
            const movieItem=document.createElement("div");
            movieItem.className="movie-item";

            const movieInfo=document.createElement("div");
            movieInfo.className="movie-info";

            const buttonRemove=document.createElement("button");
            buttonRemove.className="remove-movie-btn";
            buttonRemove.textContent="Remove";

            const moviePoster=document.createElement("img");
            moviePoster.className="movie-poster";
            moviePoster.src=item.infomation.image;
            moviePoster.alt="Movie Poster";

            const movieCard=document.createElement("div");

            const movieName=document.createElement("p");
            movieName.className="movie-name";
            movieName.textContent=item.infomation.title;

            movieCard.appendChild(movieName);
            movieInfo.appendChild(moviePoster);
            movieInfo.appendChild(movieCard);
            movieItem.appendChild(movieInfo);
            movieItem.appendChild(buttonRemove);
            moviesListContainer.appendChild(movieItem);

        });
    }else{
        const emptyMessage = document.createElement("div");
        emptyMessage.className = "empty-movie-message";
        emptyMessage.textContent = "Nothing inside yet.";
        moviesListContainer.appendChild(emptyMessage);
    }
}

function countingWordEvent(){

    // nameTextArea.addEventListener('input', () => {
    //     nameTextArea.value = nameTextArea.value.replace(/[\r\n]+/g, ' ');
    //     nameCharCount.textContent = `${nameTextArea.value.length}/30`;
    // });

    // descriptionTextArea.addEventListener('input', () => {
    //     descriptionTextArea.value = descriptionTextArea.value.replace(/[\r\n]+/g, ' ');
    //     descCharCount.textContent = `${descriptionTextArea.value.length}/100`;
    // });

    nameTextAreas.forEach((textarea, i) => {
        const counter = nameCharCounts[i];
        if (!counter) return;

        textarea.addEventListener('input', () => {
            textarea.value = textarea.value.replace(/[\r\n]+/g, ' ');
            counter.textContent = `${textarea.value.length}/30`;
        });
    });

    descriptionTextAreas.forEach((textarea, i) => {
        const counter = descCharCounts[i];
        if (!counter) return;

        textarea.addEventListener('input', () => {
            textarea.value = textarea.value.replace(/[\r\n]+/g, ' ');
            counter.textContent = `${textarea.value.length}/110`;
        });
    });
}

async function updateContent(collectionName){
    if(userId&&collectionName){
        
        try {
            
            const response = await fetch(
                `http://localhost:3000/userCollection?userId=${userId}&collectionName=${encodeURIComponent(collectionName)}`
            );
            // console.log(`${encodeURIComponent(collectionName)}`);

            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }

            const data = await response.json();

            console.log('Collection Name:', data.collectionName);
            console.log('Description:', data.description);
            console.log('Movies:');
            console.log(data.items);
            currentCollectionDescription=data.description;
            currentCollectionItem=data.items;
            updateListItem(data);
            


        } catch (error) {
            console.error('Error fetching collection movies:', error);
        } finally{
            loadingScreen.style.display='none'
        }
    }else{
        console.log("User not login, showing default page");
    }

}

async function loadingScreenPage(){
    loadingScreen.style.display='block';
    await sleep(1000);
}
function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updateTitleAndDescription(title,description){
    const collectionTitle=document.getElementById("collection-title");
    const collectionDescription=document.getElementById("collection-desc");

    collectionTitle.textContent=title;
    collectionDescription.textContent=description;
}

function calculateAndUpdate(typeCount){
    const itemCount = document.querySelector("#itemCount");
    const musicCount = document.querySelector("#musicCount");
    const movieCount = document.querySelector("#movieCount");
    const bookCount = document.querySelector("#bookCount");

    const total = Object.values(typeCount).reduce((sum, val) => sum + val, 0);
    itemCount.textContent=total;
    musicCount.textContent=typeCount["music"] || 0;
    movieCount.textContent=typeCount["movie"] || 0;
    bookCount.textContent=typeCount["book"] || 0;
}

function updateListItem(data){
    collectionPage.style.display='flex'
    updateTitleAndDescription(data.collectionName,data.description);
    const movieGrid=document.querySelector(".collection-list .movie-grid");
    movieGrid.innerHTML = "";
    const analysisCard=collectionPage.querySelector(".analysis");
    if(data.items.length>0){
        analysisCard.style.display="flex";
        // collectionPage.style.display='flex'
        // updateTitleAndDescription(data.collectionName,data.description);
        // const baseUrl = "https://image.tmdb.org/t/p/w342";
        const typeCount={};
        data.items.forEach(item => {
            const type = item.type;
            if (!typeCount[type]) {
                typeCount[type] = 0;
            }

            // Increment the count
            typeCount[type] += 1;

            const card=document.createElement("div");
            card.className="movie-card";

            const img=document.createElement("img");
            img.src = item.infomation.image;
            img.alt = item.infomation.title;

            const infoDiv=document.createElement("div");
            infoDiv.className="info";

            const languageDiv=document.createElement("div");
            languageDiv.className="language";
            const releaseDate=document.createElement("p");
            releaseDate.textContent=item.infomation.release_date;
            releaseDate.style.color="#C2D4ED";
            releaseDate.style.fontWeight="bold";
            const language=document.createElement("p");
            language.textContent=item.type.toUpperCase();
            language.style.color="#8CA2D1";
            language.style.fontWeight="bold";
            
            const titleDiv=document.createElement("div");
            titleDiv.className="title";
            titleDiv.textContent=item.infomation.title;

            languageDiv.appendChild(releaseDate);
            languageDiv.appendChild(language);
            infoDiv.appendChild(languageDiv);
            infoDiv.appendChild(titleDiv);
            card.appendChild(img);
            card.appendChild(infoDiv);
            movieGrid.appendChild(card);
        });
        calculateAndUpdate(typeCount);
    }else {
        analysisCard.style.display="none";
        nothingInside.style.display="block";
    }
}

// Add List Page
document.querySelector('.sidebar').addEventListener('click', async function (e) {
    const link = e.target.closest('.create-btn');

    if (!link) return;

    watchlistPage.style.display="none";
    addListPage.style.display="none";
    collectionPage.style.display="none";
    editListPage.style.display="none";
    requestLogin.style.display="none";
    nothingInside.style.display="none";
    await loadingScreenPage();
    
    let clickedText = createCollection.textContent.trim();
    clickedText=clickedText.replace(/\+/g,"");
    let text=clickedText.toLowerCase().trim();
    updatePageUrl(text);

    console.log(isLoggedIn);
    // let userObj;
    
    if (userId) {
        // userObj = JSON.parse(isLoggedIn);
        addList();
    } else {
        loadingScreen.style.display='none';
        requestLogin.style.display='block';
        console.log("No user is logged in.");
    } 

});

function addList(){
    addListPage.style.display="flex";
    loadingScreen.style.display='none';
    nameTextAreas.forEach((textarea, i) => {
        textarea.value = "";
        if (nameCharCounts[i]) nameCharCounts[i].textContent = "0 / 30";
    });

    descriptionTextAreas.forEach((textarea, i) => {
        textarea.value = "";
        if (descCharCounts[i]) descCharCounts[i].textContent = "0 / 110";
    });
}

function checkDuplicateName(collectionName){
    // console.log(allCollectionName);
    const lowerCaseCollectionName = collectionName.toLowerCase();
    const lowerCaseList = allCollectionName.map(name => name.toLowerCase());
    if(lowerCaseList.includes(lowerCaseCollectionName)){
        return false;
    }else{
        return true;
    }
}
async function reloadAndNavigate(collectionName){
    addListPage.style.display="none";
    await loadingScreenPage();
    await buttonCreation();

    setTimeout(() => {
        const newButton = Array.from(document.querySelectorAll('.collectionType'))
            .find(link => link.textContent.trim().toLowerCase() === collectionName.toLowerCase());

        if (newButton) {
            newButton.click();
        }
    }, 100);
}

// async function addItemFunction(userId,collectionName,itemId,type){
//     if (userId && collectionName && itemId && type) {
//         try {
//             const response = await fetch(
//                 `http://localhost:3000/addToCollection?userId=${userId}&collectionName=${encodeURIComponent(collectionName)}&itemId=${encodeURIComponent(itemId)}&type=${encodeURIComponent(type)}`,
//                 {
//                     method: 'POST'
//                 }
//             );

//             if (!response.ok) {
//                 throw new Error(`Server responded with status ${response.status}`);
//             }

//             const data = await response.json();

//             if (!response.ok) {
//                 // Show detailed message from server
//                 console.error('Server error:', data.message || 'Unknown error');
//                 alert(`Failed to add: ${data.message || 'Unknown server error'}`);
//                 return;
//             }

//             console.log('Add to Collection response:', data);

//         } catch (error) {
//             console.error('Error adding item to collection:', error);
//         }
//     }
// }