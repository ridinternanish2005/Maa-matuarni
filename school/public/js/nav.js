
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    const navLinks = document.getElementById('navLinks');
    const menuIcon = document.querySelector('.menu-icon');
    
    if (navLinks && menuIcon && !navLinks.contains(event.target) && !menuIcon.contains(event.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }
});

// Mobile dropdown toggle
document.querySelectorAll('.dropdown > a').forEach(item => {
    item.addEventListener('click', function(e) {
        if (window.innerWidth <= 992) {
            e.preventDefault();
            this.parentElement.classList.toggle('active');
        }
    });
});

// Function for admission form
function openAdmissionForm() {
    alert('Admission form will open here');
}
