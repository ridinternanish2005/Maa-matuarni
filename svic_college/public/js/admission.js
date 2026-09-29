
    (function() {
        // Create particles
        const container = document.getElementById('particles');
        for (let i = 0; i < 45; i++) {
            const p = document.createElement('div');
            p.classList.add('particle');
            const size = Math.random() * 80 + 15;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = Math.random() * 25 + 15 + 's';
            p.style.animationDelay = Math.random() * 10 + 's';
            container.appendChild(p);
        }

        const form = document.getElementById('admissionForm');
        const msgDiv = document.getElementById('formMessage');
        const submitBtn = document.getElementById('submitBtn');
        const addressField = document.getElementById('address');
        const counter = document.getElementById('addressCounter');
        const parentMobile = document.getElementById('parent_mobile');
        const classRadios = document.querySelectorAll('input[name="class_applying"]');
        const streamSelect = document.getElementById('stream');
        const streamRequiredSpan = document.getElementById('streamRequired');
        const pincode = document.getElementById('pincode');


        document
  .getElementById("admissionForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/admissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      alert(result.message);
      console.log(result);
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  });
        // Character counter
        if (addressField && counter) {
            addressField.addEventListener('input', function() {
                let len = this.value.length;
                if (len > 300) { this.value = this.value.substring(0, 300); len = 300; }
                counter.textContent = `${len}/300 characters`;
                counter.style.color = len > 280 ? '#6366f1' : '#94a3b8';
            });
        }

        // Mobile sanitization
        if (parentMobile) {
            parentMobile.addEventListener('input', function() { this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10); });
        }
        if (pincode) {
            pincode.addEventListener('input', function() { this.value = this.value.replace(/[^0-9]/g, '').slice(0, 6); });
        }

        // Stream requirement toggle
        function updateStreamRequirement() {
            let selected = null;
            classRadios.forEach(r => { if (r.checked) selected = r.value; });
            if (selected === '11' || selected === '12') {
                streamSelect.setAttribute('required', 'required');
                streamRequiredSpan.style.display = 'inline';
            } else {
                streamSelect.removeAttribute('required');
                streamRequiredSpan.style.display = 'none';
            }
        }
        classRadios.forEach(r => r.addEventListener('change', updateStreamRequirement));

        function showMessage(type, text) {
            msgDiv.className = `alert-message alert-${type}`;
            msgDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i> <strong>${type === 'success' ? 'Application Submitted!' : 'Error'}</strong><br>${text}`;
            msgDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
                msgDiv.style.opacity = '0';
                setTimeout(() => { msgDiv.className = 'alert-message'; msgDiv.style.opacity = ''; }, 400);
            }, 8000);
        }

        function isValidEmail(email) { return /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email); }
        function removeError(id) { const g = document.getElementById(id); if(g) g.classList.remove('error'); }
        function addError(id) { const g = document.getElementById(id); if(g) g.classList.add('error'); }

        function calculateAge(dob) {
            const birth = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
            return age;
        }

        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const studentName = document.getElementById('student_name').value.trim();
            const dob = document.getElementById('dob').value;
            const gender = document.getElementById('gender').value;
            let selectedClass = null;
            classRadios.forEach(r => { if (r.checked) selectedClass = r.value; });
            const fatherName = document.getElementById('father_name').value.trim();
            const motherName = document.getElementById('mother_name').value.trim();
            const parentMobileVal = document.getElementById('parent_mobile').value.trim();
            const parentEmailVal = document.getElementById('parent_email').value.trim();
            const address = document.getElementById('address').value.trim();
            const stream = streamSelect.value;

            ['group-studentName', 'group-dob', 'group-gender', 'group-fatherName', 'group-motherName', 'group-parentMobile', 'group-parentEmail', 'group-address'].forEach(removeError);

            if (!studentName) { addError('group-studentName'); showMessage('error', 'Enter student name.'); return; }
            if (!dob) { addError('group-dob'); showMessage('error', 'Select date of birth.'); return; }
            const age = calculateAge(dob);
            if (age < 13 || age > 19) { addError('group-dob'); showMessage('error', 'Age must be 13-19 years for classes 9-12.'); return; }
            if (!gender) { addError('group-gender'); showMessage('error', 'Select gender.'); return; }
            if (!selectedClass) { showMessage('error', 'Select applying class.'); return; }
            if ((selectedClass === '11' || selectedClass === '12') && !stream) { showMessage('error', 'Select stream for Class 11/12.'); return; }
            if (!fatherName) { addError('group-fatherName'); showMessage('error', 'Enter father\'s name.'); return; }
            if (!motherName) { addError('group-motherName'); showMessage('error', 'Enter mother\'s name.'); return; }
            if (!parentMobileVal || parentMobileVal.length !== 10) { addError('group-parentMobile'); showMessage('error', 'Valid 10-digit mobile required.'); return; }
            if (!parentEmailVal || !isValidEmail(parentEmailVal)) { addError('group-parentEmail'); showMessage('error', 'Valid email required.'); return; }
            if (!address) { addError('group-address'); showMessage('error', 'Enter address.'); return; }

            const photo = document.getElementById('student_photo').files[0];
            if (photo && photo.size > 2 * 1024 * 1024) { showMessage('error', 'Photo must be < 2MB.'); return; }

            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Admission...';
            submitBtn.disabled = true;

            const formData = new FormData();
            formData.append('student_name', studentName);
            formData.append('dob', dob);
            formData.append('gender', gender);
            formData.append('category', document.getElementById('category').value);
            formData.append('class_applying', selectedClass);
            formData.append('stream', stream);
            formData.append('previous_school', document.getElementById('previous_school').value);
            formData.append('percentage', document.getElementById('percentage').value);
            formData.append('board', document.getElementById('board').value);
            formData.append('father_name', fatherName);
            formData.append('mother_name', motherName);
            formData.append('parent_mobile', parentMobileVal);
            formData.append('parent_email', parentEmailVal);
            formData.append('occupation', document.getElementById('occupation').value);
            formData.append('annual_income', document.getElementById('annual_income').value);
            formData.append('address', address);
            formData.append('city', document.getElementById('city').value);
            formData.append('pincode', document.getElementById('pincode').value);
            formData.append('birth_certificate', document.getElementById('birth_certificate').files[0]);
            formData.append('marksheet', document.getElementById('marksheet').files[0]);
            formData.append('student_photo', photo);

            try {
                await new Promise(resolve => setTimeout(resolve, 1800));
                const apps = JSON.parse(localStorage.getItem('msd_admissions') || '[]');
                apps.push({ id: Date.now(), student: studentName, class: selectedClass, stream: stream, timestamp: new Date().toLocaleString() });
                localStorage.setItem('msd_admissions', JSON.stringify(apps));
                showMessage('success', `✨ Admission application submitted for ${studentName} (Class ${selectedClass}). Our team will contact you within 3-5 days. ✨`);
                form.reset();
                if (counter) counter.textContent = '0/300 characters';
                classRadios.forEach(r => r.checked = false);
                streamSelect.removeAttribute('required');
            } catch (err) {
                showMessage('error', 'Network error. Please try again.');
            } finally {
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
            }
        });

        submitBtn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            this.style.position = 'relative';
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 700);
        });
        console.log('✅ Full Screen Admission Form Ready - Classes 9 to 12');
    })();
