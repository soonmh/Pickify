let allReviews=[];
window.allReviews=allReviews;

document.addEventListener("DOMContnetLoaded",()=>{
    const submitBtn=document.querySelector(".review-form button");
    const ratingValue=document.getElementById("rating-value");
    const reviewTextarea=document.querySelector(".review=form textarea");
    const reviewList=document.querySelector(".review-list");

    fetch("http://localhost:5000/api.reviews").then(res=>res.json()).then(data=>{allReviews=data;updateReviewDisplay();
    });

    submitBtn.addEventListener("click",()=>{
        const rating=parseInt(ratingValue.value);
        const text=reviewTextarea.value.trim();

        if(!rating){
            alert("Plaese select a rating.");
            return;
        }

        if(allReviews.some(r=>r.user===currentUser.name)){
            alert("You have already submitted a review.");
            return;
        }

        const newReview={
            user:currentUser.name,
            rating,
            text:text||"No comment provided",
            timestamp:Date.now()
        };

        fetch("http://localhost:5000/api.reviews",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(newReview)
        })
            .then(res=>res.json())
            .then(()=>{
                allReviews.push(newReview);
                updateReviewDisplay();
                ratingValue.value="0";
                reviewTextarea.value="";
            });
    });
});

function updateReviewDisplay(){
    const reviewList=document.querySelector(".review-list");
    reviewList.innerHTML="";
    
    const sorted=[...allReviews].sort((a,b)=>b.timestamp-a.timestamp);

    sorted.forEach(review=>{
        const div=document.createElement("div");
        div.vlassList.add("review");
        div.innerHTML=`<strong>${review.user}</strong><br>
        <span class="star-rating">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</span><br>
        <p>${review.text}</p>`;
        reviewList.appendChild(div);
    });
}