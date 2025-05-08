window.addEventListener("DOMContentLoaded", () => {
    addEditButtons();
});

function addEditButtons() {
    document.querySelectorAll(".review").forEach((review) => {
        const author = review.getAttribute("data-user"); 
        const reviewContent = review.querySelector(".review-content");
        const reviewText = review.querySelector(".review-text");
        const buttonsDiv = document.createElement("div");
        buttonsDiv.classList.add("review-buttons");
    

        if (author === currentUser.name) {
            const editBtn = document.createElement("a");
            editBtn.className = "edit-btn";
            editBtn.innerText = "Edit";
            editBtn.href="#";
            editBtn.style.marginRight="10px";
            editBtn.addEventListener("click", (event) => {
                event.preventDefault();
                editReview(review.id); 
            });
            const liElement=document.createElement("ul");
            liElement.appendChild(editBtn);
            buttonsDiv.appendChild(liElement); 
        }

        const reportBtn=document.createElement("a");
        reportBtn.className="report-btn edit-btn";
        reportBtn.innerText="Report";
        reportBtn.href="#";
        const reportLi = document.createElement("ul");
        reportLi.appendChild(reportBtn);
        buttonsDiv.appendChild(reportLi);
        reviewContent.insertBefore(buttonsDiv, reviewText.nextSibling);
    });
}

function editReview(id) {
    const review = document.getElementById(id);
    const textEl = review.querySelector(".review-text");
    const starEl = review.querySelector(".star-rating");

    const currentText = textEl.innerText;
    const currentRating = starEl.getAttribute("data-rating");

    textEl.outerHTML = `<textarea class="review-text styled-textarea">${currentText}</textarea>`;

    starEl.outerHTML = `
        <select class="star-rating styled-select">
            <option value="5" ${currentRating == 5 ? "selected" : ""}>★★★★★</option>
            <option value="4" ${currentRating == 4 ? "selected" : ""}>★★★★☆</option>
            <option value="3" ${currentRating == 3 ? "selected" : ""}>★★★☆☆</option>
            <option value="2" ${currentRating == 2 ? "selected" : ""}>★★☆☆☆</option>
            <option value="1" ${currentRating == 1 ? "selected" : ""}>★☆☆☆☆</option>
        </select>
    `;

    const buttonsDiv = review.querySelector(".review-buttons");
    buttonsDiv.innerHTML = "";
    const saveBtn=document.createElement("button");
    saveBtn.className="save-btn styled-button";
    saveBtn.innerText="Save";
    saveBtn.addEventListener("click",()=>saveReview(id));
    buttonsDiv.appendChild(saveBtn);
}

function saveReview(id) {
    const review = document.getElementById(id);
    const textArea = review.querySelector("textarea.review-text");
    const ratingSelect = review.querySelector("select.star-rating");

    const newText = textArea.value;
    const newRating = ratingSelect.value;
    const stars = "★★★★★☆☆☆☆☆".slice(5 - newRating, 10 - newRating);
    textArea.outerHTML = `<p class="review-text">${newText}</p>`;

    ratingSelect.outerHTML = `<span class="star-rating" data-rating="${newRating}">${stars}</span>`;

    const reviewIndex = allReviews.findIndex(r => r.user === review.dataset.user);
    if (reviewIndex !== -1) {
        allReviews[reviewIndex].text = newText;
        allReviews[reviewIndex].rating = parseInt(newRating);
    }

    const buttonsDiv = review.querySelector(".review-buttons");
    buttonsDiv.innerHTML = `<ul><a href="#" class="edit-btn" onclick="editReview('${id}')">Edit</a></li><ul><a href="#" class="report-btn edit-btn">Report</a></ul>`;

    // Update the review summary
    updateAverageRating();
}
