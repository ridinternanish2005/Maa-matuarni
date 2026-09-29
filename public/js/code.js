
        // Simple script to highlight the current section when scrolling
        document.addEventListener('DOMContentLoaded', function() {
            const sections = document.querySelectorAll('.section');
            
            const highlightSection = () => {
                let currentSection = '';
                
                sections.forEach(section => {
                    const sectionTop = section.offsetTop - 100;
                    const sectionHeight = section.clientHeight;
                    
                    if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
                        currentSection = section.id;
                        section.style.backgroundColor = '#f5f7ff';
                    } else {
                        section.style.backgroundColor = 'white';
                    }
                });
            };
            
            window.addEventListener('scroll', highlightSection);
            
            // Add smooth scrolling for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const targetId = this.getAttribute('href');
                    if(targetId === '#') return;
                    
                    const targetElement = document.querySelector(targetId);
                    if(targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        });
    