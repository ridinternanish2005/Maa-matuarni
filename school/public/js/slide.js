

    // Initialize Swiper Slider
    const swiper = new Swiper('.hero-slider', {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        effect: 'slide',
        speed: 1000,
        grabCursor: true,
        keyboard: {
            enabled: true,
        },
        touchRatio: 1,
    });

    // Pause autoplay on hover
    const heroSlider = document.querySelector('.hero-slider');
    if (heroSlider) {
        heroSlider.addEventListener('mouseenter', () => {
            swiper.autoplay.stop();
        });
        
        heroSlider.addEventListener('mouseleave', () => {
            swiper.autoplay.start();
        });
    }

    // Function for admission button
    function openAdmissionForm() {
        alert('Admission form will open here');
    }
