
    (function() {
        const form = document.getElementById('admissionForm');
        const statusDiv = document.getElementById('formStatus');
        let isSubmitting = false;

        // Helper to show message
        function showMessage(msg, type) {
            statusDiv.textContent = msg;
            statusDiv.className = `status-message ${type}`;
            statusDiv.style.display = 'block';
            // Auto hide after 6 seconds
            setTimeout(() => {
                if (statusDiv) {
                    statusDiv.style.display = 'none';
                    statusDiv.className = 'status-message';
                }
            }, 6000);
        }

        // Clear previous message on new input (optional, but good UX)
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                if (statusDiv.style.display === 'block') {
                    statusDiv.style.display = 'none';
                }
            });
        });

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (isSubmitting) return;

            // Get values
            const studentName = document.getElementById('studentName').value.trim();
            const dob = document.getElementById('dob').value;
            const selectedClass = document.getElementById('classSelect').value;
            const parentName = document.getElementById('parentName').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim();
            const address = document.getElementById('address').value.trim();

            let errors = [];

            // Student name
            if (!studentName) errors.push("Student name is required");
            else if (studentName.length < 2) errors.push("Name must be at least 2 characters");

            // DOB & age validation
            if (!dob) {
                errors.push("Date of birth is required");
            } else {
                const birthDate = new Date(dob);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
                if (age < 2) errors.push("Minimum age for admission is 2+ years");
                if (age > 12) errors.push("Maximum age limit for classes Nursery-5 is 12 years");
            }

            // Class
            if (!selectedClass || selectedClass === "" || selectedClass === "-- Select Class --") {
                errors.push("Please select a class");
            }

            // Parent name
            if (!parentName) errors.push("Parent/Guardian name is required");

            // Phone (10 digits, Indian format)
            if (!phone) {
                errors.push("Mobile number is required");
            } else {
                const phoneRegex = /^[6-9]\d{9}$|^[0-9]{10}$/;
                if (!phoneRegex.test(phone)) errors.push("Enter a valid 10-digit mobile number");
            }

            // Email
            if (!email) {
                errors.push("Email address is required");
            } else {
                const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
                if (!emailRegex.test(email)) errors.push("Enter a valid email address (e.g., name@example.com)");
            }

            if (errors.length > 0) {
                showMessage("⚠️ " + errors.join(" • "), "error");
                return;
            }

            // Submit simulation
            isSubmitting = true;
            const submitBtn = form.querySelector('.btn-submit');
            const originalBtnHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Submitting...';
            submitBtn.disabled = true;

            // Simulate API call
            submitBtn.innerHTML =
'<i class="fas fa-spinner fa-pulse"></i> Submitting...';

submitBtn.disabled = true;


// Real Form Submit
form.submit();
          
        });
    })();
