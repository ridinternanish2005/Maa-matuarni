
    function openMobileMenu() {
        document.getElementById('mobileMenu').classList.add('active');
        document.getElementById('screenOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeMobileMenu() {
        document.getElementById('mobileMenu').classList.remove('active');
        document.getElementById('screenOverlay').classList.remove('active');
        document.body.style.overflow = '';
    }
    function toggleMobileDropdown(element) {
        const parent = element.closest('.mobile-dropdown');
        if(parent) {
            parent.classList.toggle('active');
            const icon = element.querySelector('.fa-chevron-down');
            if(icon) icon.style.transform = parent.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    }
    document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeMobileMenu(); });
    window.addEventListener('resize', () => { if(window.innerWidth > 992) closeMobileMenu(); });
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.main-header');
        if(window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if(targetId && targetId !== '#') {
                const target = document.querySelector(targetId);
                if(target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                    if(window.innerWidth <= 992) closeMobileMenu();
                }
            }
        });
    });
    const buttons = document.querySelectorAll('.erp-btn, .mobile-erp-btn, .apply-notice-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            this.style.position = 'relative';
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
    console.log("✅ Navbar Fixed: Logo + ERP button inline, no wrapping!");
