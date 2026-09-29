
  
// Hero Slider Auto-Play Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Slider Elements
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    const prevBtn = document.querySelector('.hero-nav-prev');
    const nextBtn = document.querySelector('.hero-nav-next');
    const playPauseBtn = document.querySelector('.play-pause-btn');
    const playPauseIcon = playPauseBtn.querySelector('i');
    const currentSlideEl = document.querySelector('.current-slide');
    const totalSlidesEl = document.querySelector('.total-slides');
    
    // Slider Variables
    let currentSlide = 0;
    let autoPlayInterval;
    let isAutoPlaying = true;
    const slideDuration = 5000; // 5 seconds per slide
    
    // Initialize
    totalSlidesEl.textContent = slides.length;
    updateSlideCounter();
    
    // Start auto-play
    startAutoPlay();
    
    // Function to show specific slide
    function showSlide(index) {
        // Remove active class from all slides and dots
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        dots.forEach(dot => {
            dot.classList.remove('active');
            const progress = dot.querySelector('.hero-dot-progress');
            progress.style.width = '0%';
            progress.style.transition = 'none';
        });
        
        // Add active class to current slide and dot
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        
        // Start progress animation on active dot
        const activeProgress = dots[index].querySelector('.hero-dot-progress');
        setTimeout(() => {
            activeProgress.style.transition = `width ${slideDuration}ms linear`;
            activeProgress.style.width = '100%';
        }, 50);
        
        currentSlide = index;
        updateSlideCounter();
    }
    
    // Function to show next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    // Function to show previous slide
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }
    
    // Function to start auto-play
    function startAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }
        
        autoPlayInterval = setInterval(() => {
            if (isAutoPlaying) {
                nextSlide();
            }
        }, slideDuration);
        
        playPauseIcon.classList.remove('fa-play');
        playPauseIcon.classList.add('fa-pause');
        playPauseBtn.classList.add('active');
        playPauseBtn.title = 'Pause Auto-Play';
        isAutoPlaying = true;
    }
    
    // Function to stop auto-play
    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
        playPauseIcon.classList.remove('fa-pause');
        playPauseIcon.classList.add('fa-play');
        playPauseBtn.classList.remove('active');
        playPauseBtn.title = 'Play Auto-Play';
        isAutoPlaying = false;
    }
    
    // Function to toggle auto-play
    function toggleAutoPlay() {
        if (isAutoPlaying) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
    }
    
    // Function to update slide counter
    function updateSlideCounter() {
        currentSlideEl.textContent = currentSlide + 1;
    }
    
    // Event Listeners
    
    // Previous button
    prevBtn.addEventListener('click', () => {
        prevSlide();
        if (isAutoPlaying) {
            stopAutoPlay();
            setTimeout(startAutoPlay, 10000); // Restart after 10 seconds
        }
    });
    
    // Next button
    nextBtn.addEventListener('click', () => {
        nextSlide();
        if (isAutoPlaying) {
            stopAutoPlay();
            setTimeout(startAutoPlay, 10000); // Restart after 10 seconds
        }
    });
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            if (isAutoPlaying) {
                stopAutoPlay();
                setTimeout(startAutoPlay, 10000); // Restart after 10 seconds
            }
        });
    });
    
    // Play/Pause button
    playPauseBtn.addEventListener('click', toggleAutoPlay);
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            if (isAutoPlaying) {
                stopAutoPlay();
                setTimeout(startAutoPlay, 10000);
            }
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            if (isAutoPlaying) {
                stopAutoPlay();
                setTimeout(startAutoPlay, 10000);
            }
        } else if (e.key === ' ' || e.key === 'Spacebar') {
            toggleAutoPlay();
            e.preventDefault();
        }
    });
    
    // Pause on hover (optional)
    const hero = document.querySelector('.hero');
    hero.addEventListener('mouseenter', () => {
        if (isAutoPlaying) {
            const activeProgress = dots[currentSlide].querySelector('.hero-dot-progress');
            activeProgress.style.transition = 'width 0ms linear';
            activeProgress.style.width = activeProgress.style.width;
        }
    });
    
    hero.addEventListener('mouseleave', () => {
        if (isAutoPlaying) {
            const activeProgress = dots[currentSlide].querySelector('.hero-dot-progress');
            const remainingWidth = 100 - parseInt(activeProgress.style.width || '0');
            const remainingTime = (remainingWidth / 100) * slideDuration;
            
            setTimeout(() => {
                activeProgress.style.transition = `width ${remainingTime}ms linear`;
                activeProgress.style.width = '100%';
            }, 50);
        }
    });
    
    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    hero.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    hero.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left - next slide
            nextSlide();
            if (isAutoPlaying) {
                stopAutoPlay();
                setTimeout(startAutoPlay, 10000);
            }
        }
        
        if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right - previous slide
            prevSlide();
            if (isAutoPlaying) {
                stopAutoPlay();
                setTimeout(startAutoPlay, 10000);
            }
        }
    }
});
