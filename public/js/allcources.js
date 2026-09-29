
        document.addEventListener('DOMContentLoaded', function() {
            // Toggle department sections
            const departmentTitles = document.querySelectorAll('.department-title');
            departmentTitles.forEach(title => {
                title.addEventListener('click', function() {
                    const coursesGrid = this.nextElementSibling;
                    const toggleIcon = this.querySelector('.toggle-icon i');
                    
                    if (coursesGrid.style.display === 'none') {
                        coursesGrid.style.display = 'grid';
                        toggleIcon.className = 'fas fa-chevron-down';
                    } else {
                        coursesGrid.style.display = 'none';
                        toggleIcon.className = 'fas fa-chevron-up';
                    }
                });
            });
            
            // Filter courses by category
            const filterBtns = document.querySelectorAll('.filter-btn');
            const courseCards = document.querySelectorAll('.course-card');
            const departmentSections = document.querySelectorAll('.department-section');
            const noResults = document.getElementById('no-results');
            
            filterBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    // Update active button
                    filterBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    const filterValue = this.getAttribute('data-filter');
                    let visibleCards = 0;
                    let visibleDepartments = 0;
                    
                    // Show/hide course cards based on filter
                    courseCards.forEach(card => {
                        const cardCategory = card.getAttribute('data-course');
                        
                        if (filterValue === 'all' || cardCategory === filterValue) {
                            card.style.display = 'flex';
                            visibleCards++;
                        } else {
                            card.style.display = 'none';
                        }
                    });
                    
                    // Show/hide department sections based on visible cards
                    departmentSections.forEach(dept => {
                        const deptCategory = dept.getAttribute('data-dept');
                        const deptCards = dept.querySelectorAll('.course-card');
                        let visibleDeptCards = 0;
                        
                        deptCards.forEach(card => {
                            if (card.style.display !== 'none') {
                                visibleDeptCards++;
                            }
                        });
                        
                        if (filterValue === 'all' || deptCategory === filterValue) {
                            dept.style.display = 'block';
                            if (visibleDeptCards > 0) {
                                dept.style.display = 'block';
                                visibleDepartments++;
                            } else {
                                dept.style.display = 'none';
                            }
                        } else {
                            dept.style.display = 'none';
                        }
                    });
                    
                    // Show no results message if no cards visible
                    if (visibleCards === 0) {
                        noResults.style.display = 'block';
                    } else {
                        noResults.style.display = 'none';
                    }
                });
            });
            
            // Search functionality
            const searchInput = document.getElementById('course-search');
            const searchBtn = document.getElementById('search-btn');
            
            function performSearch() {
                const searchTerm = searchInput.value.toLowerCase().trim();
                let visibleCards = 0;
                
                if (searchTerm === '') {
                    // If search is empty, show all cards based on active filter
                    const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
                    filterBtns.forEach(btn => {
                        if (btn.getAttribute('data-filter') === activeFilter) {
                            btn.click();
                        }
                    });
                    return;
                }
                
                courseCards.forEach(card => {
                    const cardText = card.textContent.toLowerCase();
                    const cardHeader = card.querySelector('.course-header h4').textContent.toLowerCase();
                    const cardCode = card.querySelector('.course-code').textContent.toLowerCase();
                    
                    if (cardText.includes(searchTerm) || cardHeader.includes(searchTerm) || cardCode.includes(searchTerm)) {
                        card.style.display = 'flex';
                        card.parentElement.parentElement.style.display = 'block'; // Show parent department
                        visibleCards++;
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                // Show no results message if no cards visible
                if (visibleCards === 0) {
                    noResults.style.display = 'block';
                } else {
                    noResults.style.display = 'none';
                }
                
                // Update filter buttons to show "Search Results"
                filterBtns.forEach(btn => btn.classList.remove('active'));
            }
            
            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keyup', function(event) {
                if (event.key === 'Enter') {
                    performSearch();
                }
            });
            
            // "Apply Now" button functionality
            const applyBtns = document.querySelectorAll('.apply-btn');
            applyBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const courseCard = this.closest('.course-card');
                    const courseName = courseCard.querySelector('.course-header h4').textContent;
                    const courseCode = courseCard.querySelector('.course-code').textContent;
                    
                    alert(`You are applying for:\n\n${courseCode} - ${courseName}\n\nYou will be redirected to the application form.`);
                    // In a real application, this would redirect to the application page
                    // window.location.href = `/apply?course=${courseCode}`;
                });
            });
            
            // "View Details" button functionality
            const viewDetailsLinks = document.querySelectorAll('.view-details');
            viewDetailsLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const courseCard = this.closest('.course-card');
                    const courseName = courseCard.querySelector('.course-header h4').textContent;
                    const courseCode = courseCard.querySelector('.course-code').textContent;
                    
                    alert(`Detailed information for:\n\n${courseCode} - ${courseName}\n\nThis would open a detailed course information page with syllabus, faculty details, and more.`);
                    // In a real application, this would open a course details page
                    // window.location.href = `/courses/${courseCode}`;
                });
            });
        });
