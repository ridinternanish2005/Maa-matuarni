
    function subscribeNewsletter() {
        const emailInput = document.querySelector('.newsletter-form input');
        const email = emailInput.value.trim();
        
        if (email === "") {
            alert("Please enter your email address");
        } else if (!email.includes("@") || !email.includes(".")) {
            alert("Please enter a valid email address");
        } else {
            alert("Thank you for subscribing to our newsletter!");
            emailInput.value = "";
        }
    }
