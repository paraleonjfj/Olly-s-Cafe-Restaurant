document.addEventListener("DOMContentLoaded", function () {

    const reviewForm = document.getElementById("review-form");
    if (!reviewForm) return;

    const nameInput = document.getElementById("customer-name");
    const commentInput = document.getElementById("customer-comment");
    const ratingInput = document.getElementById("selected-rating");
    const starButtons = document.querySelectorAll("#star-rating button");
    const photoInput = document.getElementById("review-photos");
    const photoPreview = document.getElementById("photo-preview");
    const reviewsContainer = document.getElementById("reviews-container");
    const emptyReviews = document.getElementById("empty-reviews");
    const averageRating = document.getElementById("average-rating");
    const averageStars = document.getElementById("average-stars");
    const reviewCount = document.getElementById("review-count");
    const reviewMessage = document.getElementById("review-message");

    const storageKey = "ollysCustomerReviews";
    let reviews = [];
    let selectedPhotos = [];

    try {
        reviews = JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch (e) {
        reviews = [];
    }

    function saveReviews() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(reviews));
            return true;
        } catch (e) {
            return false;
        }
    }

    // ----- STARS -----
    function updateStars(rating) {
        starButtons.forEach(function (star) {
            const value = Number(star.dataset.rating);
            if (value <= rating) {
                star.classList.add("selected");
                star.textContent = "★";
            } else {
                star.classList.remove("selected");
                star.textContent = "☆";
            }
        });
        ratingInput.value = rating;
    }

    starButtons.forEach(function (star) {
        star.addEventListener("click", function () {
            updateStars(Number(star.dataset.rating));
        });
    });

    // ----- PHOTO PREVIEW -----
    photoInput.addEventListener("change", function () {
        photoPreview.innerHTML = "";
        selectedPhotos = [];
        reviewMessage.textContent = "";

        const files = Array.from(photoInput.files);

        if (files.length > 2) {
            reviewMessage.textContent = "You can only upload up to 2 photos.";
            photoInput.value = "";
            return;
        }

        for (const file of files) {
            if (!file.type.startsWith("image/")) {
                reviewMessage.textContent = "Please upload image files only.";
                photoInput.value = "";
                return;
            }
            if (file.size > 300 * 1024) {
                reviewMessage.textContent = "Each photo must be 300 KB or smaller.";
                photoInput.value = "";
                return;
            }

            const reader = new FileReader();
            reader.onload = function (event) {
                selectedPhotos.push(event.target.result);
                const img = document.createElement("img");
                img.src = event.target.result;
                photoPreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });

    // ----- DISPLAY REVIEWS -----
    function displayReviews() {
        reviewsContainer.innerHTML = "";
        emptyReviews.style.display = reviews.length === 0 ? "block" : "none";

        let total = 0;

        reviews.forEach(function (review, index) {
            total += Number(review.rating);

            const card = document.createElement("div");
            card.className = "review-card";

            const name = document.createElement("h3");
            name.textContent = review.name;

            const stars = document.createElement("div");
            stars.className = "review-stars";
            stars.textContent = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

            const date = document.createElement("p");
            date.className = "review-date";
            date.textContent = review.date;

            const comment = document.createElement("p");
            comment.className = "review-text";
            comment.textContent = review.comment;

            card.append(name, stars, date, comment);

            if (review.photos && review.photos.length > 0) {
                const photosDiv = document.createElement("div");
                photosDiv.className = "review-photos";
                review.photos.forEach(function (src) {
                    const img = document.createElement("img");
                    img.src = src;
                    img.alt = "Customer review photo";
                    photosDiv.appendChild(img);
                });
                card.appendChild(photosDiv);
            }

            const del = document.createElement("button");
            del.type = "button";
            del.className = "delete-review";
            del.textContent = "Delete review";
            del.addEventListener("click", function () {
                reviews.splice(index, 1);
                saveReviews();
                displayReviews();
            });
            card.appendChild(del);

            reviewsContainer.appendChild(card);
        });

        reviewCount.textContent = reviews.length;

        if (reviews.length > 0) {
            const avg = total / reviews.length;
            averageRating.textContent = avg.toFixed(1);
            const rounded = Math.round(avg);
            averageStars.textContent = "★".repeat(rounded) + "☆".repeat(5 - rounded);
        } else {
            averageRating.textContent = "0.0";
            averageStars.textContent = "☆☆☆☆☆";
        }
    }

    // ----- SUBMIT -----
    reviewForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = nameInput.value.trim();
        const comment = commentInput.value.trim();
        const rating = Number(ratingInput.value);

        if (rating === 0) {
            reviewMessage.textContent = "Please select a star rating.";
            return;
        }
        if (name === "" || comment === "") {
            reviewMessage.textContent = "Please complete all required fields.";
            return;
        }

        reviews.unshift({
            name: name,
            comment: comment,
            rating: rating,
            date: new Date().toLocaleDateString(),
            photos: selectedPhotos
        });

        if (!saveReviews()) {
            reviews.shift();
            reviewMessage.textContent = "Could not save. The photos may be too large, so try smaller ones.";
            return;
        }

        reviewForm.reset();
        selectedPhotos = [];
        photoPreview.innerHTML = "";
        updateStars(0);

        reviewMessage.textContent = "Thank you! Your review has been submitted.";
        displayReviews();
    });

    displayReviews();
});