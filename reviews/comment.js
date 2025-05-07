const currentUser = {
    name: "User testing",
    profilePic: "profilepic3.png"
};

window.addEventListener("DOMContentLoaded", () => {

    document.querySelector(".review-list").addEventListener("click", (event) => {
        if (event.target.classList.contains("comment-btn")) {
            const commentSection = event.target.closest(".comment-section");
            const input = commentSection.querySelector(".comment-input");
            const commentList = commentSection.querySelector(".comments");
            
            console.log("Button clicked");
            const commentText = input.value.trim();
            if (commentText !== "") {
                const comment = document.createElement("div");
                comment.className = "comment";

                const userInfo = document.createElement("div");
                userInfo.className = "user-info";

                const profilePic = document.createElement("img");
                profilePic.src = currentUser.profilePic;
                profilePic.alt = "User Profile";
                userInfo.appendChild(profilePic);

                const commentContent = document.createElement("div");
                commentContent.className = "comment-content";

                const username = document.createElement("strong");
                username.textContent = currentUser.name;

                const text = document.createElement("p");
                text.className = "comment-text";
                text.textContent = commentText;

                const reportBtn=document.createElement("a");
                reportBtn.className="report-btn edit-btn";
                reportBtn.innerText="Report";
                reportBtn.href="#";
                const reportLi = document.createElement("ul");
                reportLi.appendChild(reportBtn);
                commentContent.appendChild(reportLi);
                commentContent.appendChild(username);
                commentContent.appendChild(text);
                commentContent.appendChild(reportBtn);

                comment.appendChild(userInfo);
                comment.appendChild(commentContent);

                commentList.appendChild(comment);
                
                input.value = "";
            }
        }
    });
});
