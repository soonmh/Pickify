window.addEventListener("DOMContentLoaded",()=>{
    updateAverageRating();
    setupStarRating();
});

function updateAverageRating(){
    const reviews=document.querySelectorAll(".review .star-rating");
    let total=0;
    let count=0;
    const starCounts=[0,0,0,0,0];

    reviews.forEach(starEl=>{
        const rating=parseInt(starEl.dataset.rating);
        total+=rating;
        count++;
        if(rating>=1&&rating<=5){
            starCounts[rating-1]++;
        }
    });

    const avg=count?(total/count).toFixed(1):"0.00";
    const rounded=Math.round(avg);

    document.querySelector(".review-summary h2").textContent=`Average Rating:${avg}/5`;
    document.querySelector(".review-summary .star-rating").textContent="★".repeat(rounded) + "☆".repeat(5 - rounded);
    document.querySelector(".review-summary .breakdown p:last-child").textContent=`${count} Reviews Total`;

    const breakdownText=`
    5 stars: ${percentage(starCounts[4],count)} | 
    4 stars: ${percentage(starCounts[3],count)} |
    3 stars: ${percentage(starCounts[2],count)} |
    2 stars: ${percentage(starCounts[1],count)} |
    1 stars: ${percentage(starCounts[0],count)}`;

    document.querySelector(".review-summary .breakdown p:first-child").textContent=breakdownText;
}

function percentage(count,total){
    return total?`${Math.round((count/total)*100)}%`:"0.00%";
}

function setupStarRating(){
    const stars=document.querySelectorAll(".star-rating .star");
    const ratingValue=document.getElementById("rating-value");

    stars.forEach((star,idx)=>{
        star.addEventListener("mouseover",()=>{
            stars.forEach((s,i)=>{
                s.classList.toggle("hovered",i<=idx);
            });
        });

        star.addEventListener("mouseout",()=>{
            stars.forEach(s=>s.classList.remove("hovered"));
        });

        star.addEventListener("click",()=>{
            const rating=idx+1;
            ratingValue.value=rating;
            stars.forEach((s,i)=>{
                s.classList.toggle("selected",i<rating);
            });
        });
    });
    
}
