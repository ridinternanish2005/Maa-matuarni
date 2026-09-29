
    function submitContactForm(event) {
        event.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
        
        // Simple validation
        if (!name || !email || !subject || !message) {
            alert('Please fill in all required fields!');
            return false;
        }
        
        if (!email.includes('@') || !email.includes('.')) {
            alert('Please enter a valid email address!');
            return false;
        }
        
        // Success message
        alert(`Thank you ${name}! Your message has been sent successfully. We'll get back to you soon.`);
        
        // Reset form
        document.getElementById('contactForm').reset();
        
        return false;
    }
