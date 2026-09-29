

    
    // Initialize slider when page loads
    document.addEventListener('DOMContentLoaded', function() {
        initializeSlider();
    });
    
    // Also run on load for safety
    window.addEventListener('load', function() {
        // Re-initialize if needed (prevents issues)
        if (window.heroSwiperInstance) {
            window.heroSwiperInstance.update();
        } else {
            initializeSlider();
        }
    });
    
    function initializeSlider() {
        // Check if Swiper is available
        if (typeof Swiper === 'undefined') {
            console.error("Swiper not loaded yet, retrying...");
            setTimeout(initializeSlider, 200);
            return;
        }
        
        // Get the slider element
        const sliderElement = document.querySelector('.hero-slider');
        if (!sliderElement) {
            console.error("Slider element not found");
            return;
        }
        
        // Destroy any existing swiper instance to prevent conflicts
        if (sliderElement.swiper) {
            sliderElement.swiper.destroy(true, true);
        }
        
        // Initialize Swiper with all features
        const heroSwiper = new Swiper('.hero-slider', {
            // Core settings
            loop: true,                       // Infinite loop - slides move continuously
            autoplay: {
                delay: 4000,                  // Change slide every 4 seconds
                disableOnInteraction: false,  // Continue autoplay after user clicks
                pauseOnMouseEnter: true,      // Pause on hover
            },
            speed: 700,                       // Smooth transition speed (ms)
            effect: 'slide',                  // Standard slide effect
            
            // Interaction - TOUCH/SWIPE support
            grabCursor: true,                 // Shows grab cursor
            touchRatio: 1,                    // Full touch sensitivity
            resistance: true,
            resistanceRatio: 0.85,
            simulateTouch: true,
            allowTouchMove: true,             // Allow swipe movement - YES, SLIDE WILL MOVE ON SWIPE
            
            // Pagination (dots) - CLICKABLE
            pagination: {
                el: '.swiper-pagination',
                clickable: true,              // Click dots to navigate
                dynamicBullets: true,
            },
            
            // Navigation (arrows) - CLICKABLE
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            
            // Keyboard support - press left/right arrows
            keyboard: {
                enabled: true,
                onlyInViewport: true,
            },
            
            // Responsive
            breakpoints: {
                0: { slidesPerView: 1 },
                768: { slidesPerView: 1 }
            }
        });
        
        // Store instance for potential later use
        window.heroSwiperInstance = heroSwiper;
        
        console.log("✅ Hero Slider is WORKING! Features enabled:");
        console.log("   - Auto sliding every 4 seconds");
        console.log("   - Arrow buttons (next/prev)");
        console.log("   - Pagination dots (clickable)");
        console.log("   - Touch/swipe support on mobile");
        console.log("   - Keyboard arrow keys support");
        
        // Extra safety: manually ensure arrows trigger slide change (redundant but ensures working)
        const nextArrow = document.querySelector('.swiper-button-next');
        const prevArrow = document.querySelector('.swiper-button-prev');
        
        if (nextArrow && heroSwiper) {
            // Remove old listeners to avoid duplicates
            const newNext = nextArrow.cloneNode(true);
            nextArrow.parentNode.replaceChild(newNext, nextArrow);
            newNext.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                heroSwiper.slideNext();
            });
        }
        
        if (prevArrow && heroSwiper) {
            const newPrev = prevArrow.cloneNode(true);
            prevArrow.parentNode.replaceChild(newPrev, prevArrow);
            newPrev.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                heroSwiper.slidePrev();
            });
        }
        
        // Re-assign the navigation elements after replacement
        heroSwiper.params.navigation.nextEl = '.swiper-button-next';
        heroSwiper.params.navigation.prevEl = '.swiper-button-prev';
        heroSwiper.navigation.init();
        heroSwiper.navigation.update();
    }
    
    // Optional: Handle any background image loading issues
    window.addEventListener('load', function() {
        const slides = document.querySelectorAll('.swiper-slide');
        slides.forEach(slide => {
            const bg = slide.style.backgroundImage;
            if (bg && bg.includes('url')) {
                slide.style.backgroundSize = 'cover';
                slide.style.backgroundPosition = 'center';
            }
        });
    });
