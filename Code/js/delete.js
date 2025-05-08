window.addEventListener("DOMContentLoaded",()=>{
    addDeleteButtons();
});

function addDeleteButtons(){
    document.querySelectorAll(".review").forEach((review)=>{
        const author = review.getAttribute("data-user"); 
        if(author==currentUser.name){
            const deleteBtn=document.createElement("a");
            deleteBtn.textContent="Delete";
            deleteBtn.className="delete-btn edit-btn";
            review.querySelector(".review-content").appendChild(deleteBtn);

            
            deleteBtn.addEventListener("click",()=>{
                if(confirm("Are you sure you want to delete your review?")){
                    const index = allReviews.findIndex(r => r.user === currentUser.name);
                    if (index !== -1) {
                        allReviews.splice(index, 1);
                    }
                    review.remove();
                    enableReviewForm();
                    updateReviewDisplay(); // Update the review display
                    updateAverageRating(); // Update the average rating
                }
            });
        }
    });
}


function enableReviewForm(){
    const submitBtn=document.querySelector(".review-form button");
    submitBtn.disabled=false;
    submitBtn.title="";
}