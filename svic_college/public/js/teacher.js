
    (function() {
        // Create floating particles
        function createParticles() {
            const container = document.getElementById('particles');
            if (!container) return;
            for (let i = 0; i < 40; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');
                const size = Math.random() * 80 + 15;
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDuration = Math.random() * 25 + 15 + 's';
                particle.style.animationDelay = Math.random() * 10 + 's';
                container.appendChild(particle);
            }
        }
        createParticles();
        
        // DOM Elements
        const form = document.getElementById('teacherApplicationForm');
        const messageDiv = document.getElementById('formMessage');
        const submitBtn = document.getElementById('submitBtn');
        const addressField = document.getElementById('address');
        const addressCounter = document.getElementById('addressCounter');
        const mobileInput = document.getElementById('mobile');
        
        // Character counter for address
        if (addressField && addressCounter) {
            addressField.addEventListener('input', function() {
                let len = this.value.length;
                if (len > 300) {
                    this.value = this.value.substring(0, 300);
                    len = 300;
                }
                addressCounter.textContent = `${len}/300 characters`;
                addressCounter.style.color = len > 280 ? '#f97316' : '#94a3b8';
            });
        }
        
        // Mobile number sanitization
        if (mobileInput) {
            mobileInput.addEventListener('input', function(e) {
                this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
            });
        }
        
        // Helper: Show message
        function showMessage(type, text) {
            messageDiv.className = `alert-message alert-${type}`;
            messageDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}" style="margin-right: 12px;"></i> <strong>${type === 'success' ? 'Application Submitted!' : 'Submission Error'}</strong><br>${text}`;
            messageDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            setTimeout(() => {
                messageDiv.style.opacity = '0';
                setTimeout(() => {
                    messageDiv.className = 'alert-message';
                    messageDiv.style.opacity = '';
                }, 400);
            }, 8000);
        }
        
        // Email validation
        function isValidEmail(email) {
            return /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email);
        }
        
        // Remove error styling
        function removeError(groupId) {
            const group = document.getElementById(groupId);
            if (group) group.classList.remove('error');
        }
        
        function addError(groupId) {
            const group = document.getElementById(groupId);
            if (group) group.classList.add('error');
        }
        
        // Form submission
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get values
            const fullName = document.getElementById('full_name').value.trim();
            const email = document.getElementById('email').value.trim();
            const mobile = document.getElementById('mobile').value.trim();
            const qualification = document.getElementById('qualification').value.trim();
            const experience = document.getElementById('experience').value;
            const subject = document.getElementById('subject').value;
            const resumeFile = document.getElementById('resume').files[0];
            
            // Clear previous errors
            ['group-fullname', 'group-email', 'group-mobile', 'group-qualification', 'group-experience', 'group-subject'].forEach(id => removeError(id));
            
            // Validations
            if (!fullName) {
                addError('group-fullname');
                showMessage('error', 'Please enter your full name.');
                return;
            }
            if (!email || !isValidEmail(email)) {
                addError('group-email');
                showMessage('error', 'Please enter a valid email address.');
                return;
            }
            if (!mobile || mobile.length !== 10) {
                addError('group-mobile');
                showMessage('error', 'Please enter a valid 10-digit mobile number.');
                return;
            }
            if (!qualification) {
                addError('group-qualification');
                showMessage('error', 'Please enter your qualification.');
                return;
            }
            if (experience === '' || experience < 0) {
                addError('group-experience');
                showMessage('error', 'Please enter valid years of experience.');
                return;
            }
            if (!subject) {
                addError('group-subject');
                showMessage('error', 'Please select your subject expertise.');
                return;
            }
            if (!resumeFile) {
                showMessage('error', 'Please upload your resume/CV (PDF format).');
                return;
            }
            
            // File validation
            if (resumeFile.type !== 'application/pdf') {
                showMessage('error', 'Please upload a PDF file only.');
                return;
            }
            if (resumeFile.size > 5 * 1024 * 1024) {
                showMessage('error', 'Resume size must be less than 5MB.');
                return;
            }
            
            // Save original button text
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Application...';
            submitBtn.disabled = true;
            
            // Prepare FormData
            const formData = new FormData();
            formData.append('full_name', fullName);
            formData.append('email', email);
            formData.append('mobile', mobile);
            formData.append('qualification', qualification);
            formData.append('experience', experience);
            formData.append('subject', subject);
            formData.append('preferred_class', document.getElementById('preferred_class').value);
            formData.append('last_organization', document.getElementById('last_organization').value);
            formData.append('address', document.getElementById('address').value);
            formData.append('resume', resumeFile);
            
            try {
                // ==============================================
                // BACKEND INTEGRATION:
                // Replace with actual fetch to your PHP endpoint
                // const response = await fetch('submit_teacher.php', {
                //     method: 'POST',
                //     body: formData
                // });
                // const result = await response.json();
                // if (result.success) { ... } else { ... }
                // ==============================================
                
                // DEMO SIMULATION (Remove in production)
                await new Promise(resolve => setTimeout(resolve, 1800));
                
                // Store in localStorage for demo
                const appData = {
                    id: Date.now(),
                    name: fullName,
                    email: email,
                    mobile: mobile,
                    subject: subject,
                    exp: experience,
                    timestamp: new Date().toLocaleString()
                };
                let apps = JSON.parse(localStorage.getItem('msd_teacher_apps') || '[]');
                apps.push(appData);
                localStorage.setItem('msd_teacher_apps', JSON.stringify(apps));
                
                // Success
                showMessage('success', `✨ Thank you ${fullName.split(' ')[0]}! Your application has been submitted successfully. Our HR team will contact you within 5-7 working days. ✨`);
                form.reset();
                
                if (addressCounter) addressCounter.textContent = '0/300 characters';
                
            } catch (error) {
                console.error(error);
                showMessage('error', 'Network error. Please try again or contact support at hr@msdpublicschool.edu');
            } finally {
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
            }
        });
        
        // Ripple effect for button
        submitBtn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            this.style.position = 'relative';
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 700);
        });
        
        // Live validation on blur
        const validationFields = [
            { id: 'full_name', group: 'group-fullname', validate: (v) => v.trim().length > 0 },
            { id: 'email', group: 'group-email', validate: (v) => isValidEmail(v) },
            { id: 'mobile', group: 'group-mobile', validate: (v) => v.length === 10 && /^\d+$/.test(v) },
            { id: 'qualification', group: 'group-qualification', validate: (v) => v.trim().length > 0 },
            { id: 'experience', group: 'group-experience', validate: (v) => v >= 0 && v !== '' },
            { id: 'subject', group: 'group-subject', validate: (v) => v !== '' }
        ];
        
        validationFields.forEach(field => {
            const input = document.getElementById(field.id);
            if (input) {
                input.addEventListener('blur', function() {
                    const group = document.getElementById(field.group);
                    if (field.validate(this.value)) {
                        if (group) group.classList.remove('error');
                    } else {
                        if (group) group.classList.add('error');
                    }
                });
                input.addEventListener('focus', function() {
                    const group = document.getElementById(field.group);
                    if (group) group.classList.remove('error');
                });
            }
        });
        
        console.log('✅ MSD Public School - Full Screen Join Faculty Form Ready');
    })();
