let allReviews=[];
window.allReviews=allReviews;

document.addEventListener("DOMContentLoaded",()=>{
    const submitBtn=document.querySelector(".review-form button");
    const ratingValue=document.getElementById("rating-value");
    const reviewTextarea=document.querySelector(".review-form textarea");
    const reviewList=document.querySelector(".review-list");

    // Get entertainment details from the page
    const getEntertainmentDetails = () => {
        const itemTitle = document.querySelector('.item-title').textContent;
        const itemDescription = document.querySelector('.item-description').textContent;
        const itemPoster = document.querySelector('.item-poster').src;
        
        // Get type from URL or default to 'movies'
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type') || 'movies';
        
        // Get additional details based on type
        const details = {
            title: itemTitle,
            type: type,
            genre: document.querySelector('.item-genre')?.textContent || 'Unknown',
            image: itemPoster,
            year: document.querySelector('.item-year')?.textContent || new Date().getFullYear(),
            description: itemDescription,
            views: 0,
            rating: 0
        };

        // Add type-specific fields
        if (type === 'books') {
            details.author = document.querySelector('.item-author')?.textContent || 'Unknown';
        } else if (type === 'movies') {
            details.director = document.querySelector('.item-director')?.textContent || 'Unknown';
            details.duration = parseInt(document.querySelector('.item-duration')?.textContent) || 0;
        } else if (type === 'music') {
            details.artist = document.querySelector('.item-artist')?.textContent || 'Unknown';
        }

        return details;
    };

    fetch("http://localhost:3000/api/reviews").then(res=>res.json()).then(data=>{
        allReviews=data;
        updateReviewDisplay();
    });

    submitBtn.addEventListener("click",()=>{
        const rating=parseInt(ratingValue.value);
        const text=reviewTextarea.value.trim();
        const entertainmentDetails = getEntertainmentDetails();

        if(!rating){
            alert("Please select a rating.");
            return;
        }

        if(allReviews.some(r=>r.user===currentUser.name)){
            alert("You have already submitted a review.");
            return;
        }

        const newReview={
            entertainmentId: new URLSearchParams(window.location.search).get('id'),
            user: currentUser.name,
            rating,
            text: text || "No comment provided",
            entertainmentDetails,
            timestamp: Date.now()
        };

        fetch("http://localhost:3000/api/reviews",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(newReview)
        })
            .then(res=>res.json())
            .then(response => {
                if (response.success) {
                    allReviews.push(response.review);
                    updateReviewDisplay();
                    ratingValue.value="0";
                    reviewTextarea.value="";
                } else {
                    throw new Error(response.message);
                }
            })
            .catch(error => {
                console.error('Error submitting review:', error);
                alert('Failed to submit review. Please try again.');
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