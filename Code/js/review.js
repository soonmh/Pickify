let allReviews=[];
window.allReviews = allReviews;

document.addEventListener("DOMContentLoaded",()=>{
    const submitBtn=document.querySelector(".review-form button");
    const ratingValue=document.getElementById("rating-value");
    const reviewTextarea=document.querySelector(".review-form textarea");
    const reviewList=document.querySelector(".review-list");

    document.querySelectorAll(".review").forEach(review=>{
        const user=review.dataset.user;
        const rating=parseInt(review.querySelector(".star-rating").dataset.rating);
        const text=review.querySelector(".review-text").textContent;
        const comments = review.querySelector(".comments").innerHTML;

        allReviews.push({user,rating,text,timestamp:new Date().getTime()});
    });

    submitBtn.addEventListener("click",()=>{
        const ratingValue=parseInt(document.getElementById("rating-value").value);
        const reviewText=reviewTextarea.value.trim();
        if (allReviews.some(review => review.user === currentUser.name)) {
                    alert("You have already submitted a review.");
                    return;
        }

        if(!ratingValue){
            alert("Please select a rating before submitting your review.");
            return;
        }

        

        const newReview={user:currentUser.name,
            rating:ratingValue,
            text:reviewText||"No comment provided",
            timestamp:new Date().getTime()
        };

        allReviews.push(newReview);

        updateReviewDisplay();
        updateAverageRating();
        addDeleteButtons();
        addEditButtons();

        document.getElementById("rating-value").value = "0";
        reviewTextarea.value = "";
        

        document.querySelectorAll(".star-rating .star").forEach(star => {
            star.classList.remove("selected", "hovered");
        });
    });
});

function updateReviewDisplay(){
    const reviewList=document.querySelector(".review-list");
    const existingReviews = reviewList.querySelectorAll(".review");
    const existingComments = new Map();
    
    existingReviews.forEach(review => {
        const comments = review.querySelector(".comments").innerHTML;
        const userId = review.dataset.user;
        existingComments.set(userId, comments);
    });

    reviewList.innerHTML="";

    const sortedReviews = [...allReviews].sort((a,b) => b.timestamp - a.timestamp);

    sortedReviews.forEach(review=>{
        const reviewElement=document.createElement("div");
        reviewElement.classList.add("review");
        reviewElement.dataset.user=review.user;
        reviewElement.id = `review-${review.user.replace(/\s+/g, '-').toLowerCase()}-${review.timestamp}`;

        reviewElement.innerHTML = `
            <div class="user-info">
                <img src="${review.user === "John Doe" ? "profilepic1.png" : review.user === "Tung Sahur" ? "profilepic2.png" : "profilepic3.png"}" alt="User Profile">
            </div>
            <div class="review-content">
                <strong>${review.user}</strong>
                <span class="star-rating" data-rating="${review.rating}">${"★".repeat(review.rating)}${"☆".repeat(5-review.rating)}</span>
                <p class="review-text">${review.text}</p>
                <div class="comment-section">
                    <div class="comments">${existingComments.get(review.user) || ''}</div>
                    <input type="text" class="comment-input" placeholder="Write a comment...">
                    <button class="comment-btn">Post</button>
                </div>
            </div>
        `;

        reviewList.appendChild(reviewElement);
    });
}


