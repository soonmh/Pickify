// Make functions globally available for inline event handlers
window.addListPage = function addListPage(){
    const watchlistPage = document.querySelector(".content-inner");
    const addListPage = document.querySelector(".add-collection-container");
    const collectionPage = document.querySelector(".collectionPage");
    watchlistPage.style.display="none";
    collectionPage.style.display="none";
    addListPage.style.display="flex";
}

window.CollectionPage = function CollectionPage(linkElementOrSectionName){
    const watchlistPage = document.querySelector(".content-inner");
    const addListPage = document.querySelector(".add-collection-container");
    const collectionPage = document.querySelector(".collectionPage");
    watchlistPage.style.display="none";
    addListPage.style.display="none";
    collectionPage.style.display="flex";

    let clickedText;
    if (typeof linkElementOrSectionName === 'string') {
        clickedText = linkElementOrSectionName;
    } else {
        clickedText = linkElementOrSectionName.textContent.trim();
    }
    
    console.log("Displaying collection:", clickedText);
    const title=document.getElementById("collection-title");
    title.textContent=clickedText;
}

window.saveCollection = function saveCollection(){
    // Potentially save data here before redirecting
    window.location.href="watchList.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');

    if (section) {
        // Directly call CollectionPage with the section name
        window.CollectionPage(section);
    }
});
