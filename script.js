/* HOME PAGE IMAGE SLIDESHOW */
// Get all slides and buttons
const slides = document.querySelectorAll(".hero-slide");
const dots = document.querySelectorAll(".dot");

const previousButton = document.querySelector(".slide-arrow.prev");
const nextButton = document.querySelector(".slide-arrow.next");

const hero = document.querySelector(".hero");

// Starting slide
let currentSlide = 0;

// Show selected slide
function showSlide(index) {

    // Remove active class from all slides and dots
    slides.forEach(function(slide) {
        slide.classList.remove("active");
    });

    dots.forEach(function(dot) {
        dot.classList.remove("active");
    });

    // Update current slide
    currentSlide = (index + slides.length) % slides.length;

    // Show the selected slide
    slides[currentSlide].classList.add("active");
    dots[currentSlide].classList.add("active");
}

// Next slide
function nextSlide() {
    showSlide(currentSlide + 1);
}

// Previous slide
function previousSlide() {
    showSlide(currentSlide - 1);
}

// Button events
if (nextButton) {
    nextButton.addEventListener("click", function() {
        nextSlide();
        restartSlideshow();
    });
}

if (previousButton) {
    previousButton.addEventListener("click", function() {
        previousSlide();
        restartSlideshow();
    });
}

// Click the dots
dots.forEach(function(dot, index) {

    dot.addEventListener("click", function() {
        showSlide(index);
        restartSlideshow();
    });

});

// Automatic slideshow
let slideshowTimer;

function startSlideshow() {
    slideshowTimer = setInterval(function() {
        nextSlide();
    }, 5000);
}

// Restart timer after manual navigation
function restartSlideshow() {
    clearInterval(slideshowTimer);
    startSlideshow();
}

startSlideshow();

/* SWIPE FUNCTION FOR MOBILE */
let touchStartX = 0;
let touchEndX = 0;

hero.addEventListener("pointerdown", function(event) {
    touchStartX = event.clientX;
});

hero.addEventListener("pointerup", function(event) {

    touchEndX = event.clientX;

    let swipeDistance = touchEndX - touchStartX;

    // Swipe left = next image
    if (swipeDistance < -50) {
        nextSlide();
        restartSlideshow();
    }

    // Swipe right = previous image
    else if (swipeDistance > 50) {
        previousSlide();
        restartSlideshow();
    }

});