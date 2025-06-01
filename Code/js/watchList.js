document.addEventListener("DOMContentLoaded", function(){
    buttonCreation();
    document.querySelector('.sidebar').addEventListener('click', async function (e) {
        const link = e.target.closest('.collectionType');

        if (!link) return;

        watchlistPage.style.display = "none";
        addListPage.style.display = "none";
        collectionPage.style.display = "none";
        requestLogin.style.display = "none";
        nothingInside.style.display = "none";
        await loadingScreenPage();

        let clickedText = link.textContent.trim();
        let text = clickedText.toLowerCase().trim();
        updatePageUrl(text);

        console.log(isLoggedIn);
        let userObj;
        // console.log(userObj);
        if (isLoggedIn) {
            userObj = JSON.parse(isLoggedIn);
            updateContent(userObj.userId, clickedText);
        } else {
            loadingScreen.style.display = 'none';
            requestLogin.style.display = 'block';
            console.log("No user is logged in.");
        }

        console.log("Displaying collection:", clickedText);
    });

})

const isLoggedIn = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser');
let allCollectionName=[];

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

async function buttonCreation(){
    const myListNav = document.querySelector(".my-lists-nav");
    myListNav.innerHTML="";
    if(isLoggedIn){
        const userObj = JSON.parse(isLoggedIn);
        const userId=userObj.userId;
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

const watchlistPage = document.querySelector(".content-inner");
const addListPage = document.querySelector(".add-collection-container");
const collectionPage = document.querySelector(".collectionPage");
// const collectionType = document.querySelectorAll(".collectionType");
const createCollection = document.querySelector(".create-btn");
const loadingScreen = document.getElementById('loadingScreen');
const requestLogin = document.getElementById('requestLogin');
const nothingInside = document.getElementById("nothingInside");

async function updateContent(userId,collectionName){
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

function calculateAndUpdate(data){
    const itemCount = document.querySelector(".analysis-card h2");
    itemCount.textContent=data.movies.length;
}

function updateListItem(data){
    if(data.movies.length>0){
        collectionPage.style.display='flex'
        updateTitleAndDescription(data.collectionName,data.description);
        calculateAndUpdate(data);
        const movieGrid=document.querySelector(".collection-list .movie-grid");
        const baseUrl = "https://image.tmdb.org/t/p/w342";
        movieGrid.innerHTML = "";
        data.movies.forEach(movie => {
            const card=document.createElement("div");
            card.className="movie-card";;

            const img=document.createElement("img");
            img.src = `${baseUrl}${movie.poster_path}`;
            img.alt = movie.title;

            const infoDiv=document.createElement("div");
            infoDiv.className="info";

            const languageDiv=document.createElement("div");
            languageDiv.className="language";
            const releaseDate=document.createElement("p");
            releaseDate.textContent=movie.release_date;
            releaseDate.style.color="#C2D4ED";
            releaseDate.style.fontWeight="bold";
            const language=document.createElement("p");
            language.textContent=movie.original_language.toUpperCase();
            language.style.color="#8CA2D1";
            language.style.fontWeight="bold";
            
            const titleDiv=document.createElement("div");
            titleDiv.className="title";
            titleDiv.textContent=movie.title;

            languageDiv.appendChild(releaseDate);
            languageDiv.appendChild(language);
            infoDiv.appendChild(languageDiv);
            infoDiv.appendChild(titleDiv);
            card.appendChild(img);
            card.appendChild(infoDiv);
            movieGrid.appendChild(card);
        });
    }else {
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
    requestLogin.style.display="none";
    nothingInside.style.display="none";
    await loadingScreenPage();
    
    let clickedText = createCollection.textContent.trim();
    clickedText=clickedText.replace(/\+/g,"");
    let text=clickedText.toLowerCase().trim();
    updatePageUrl(text);

    console.log(isLoggedIn);
    let userObj;
    
    if (isLoggedIn) {
        userObj = JSON.parse(isLoggedIn);
        addList(userObj.userId);
    } else {
        loadingScreen.style.display='none';
        requestLogin.style.display='block';
        console.log("No user is logged in.");
    } 

});
let createButtonEventAttached=false;
function addList(userId){
    addListPage.style.display="flex";
    loadingScreen.style.display='none';

    nameTextArea.value = "";
    descriptionTextArea.value = "";
    nameCharCount.textContent = "0/30";
    descCharCount.textContent = "0/100";

    const createButton = document.getElementById("create-list-button");
    if(!createButtonEventAttached){
        createButton.addEventListener("click", async function(){
            const collectionName = document.getElementById("collection-name").value.trim();
            const collectionDescription = document.getElementById("collection-description").value.trim();
            
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

        createButtonEventAttached = true;
    }
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

const nameTextArea = document.getElementById("collection-name");
const descriptionTextArea = document.getElementById("collection-description");
const nameCharCount = document.getElementById("name-char-count");
const descCharCount = document.getElementById("desc-char-count");

nameTextArea.addEventListener('input', () => {
    nameTextArea.value = nameTextArea.value.replace(/[\r\n]+/g, ' ');
    nameCharCount.textContent = `${nameTextArea.value.length}/30`;
});
descriptionTextArea.addEventListener('input', () => {
    descriptionTextArea.value = descriptionTextArea.value.replace(/[\r\n]+/g, ' ');
    descCharCount.textContent = `${descriptionTextArea.value.length}/100`
});