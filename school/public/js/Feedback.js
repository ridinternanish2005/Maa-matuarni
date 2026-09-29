(function () {

    const form = document.getElementById("feedbackForm");

    const stars = document.querySelectorAll("#starRating i");

    const ratingInput =
        document.getElementById("ratingValue");

    const ratingText =
        document.getElementById("ratingText");

    const statusDiv =
        document.getElementById("formStatus");


    // STAR RATING
    stars.forEach((star) => {

        star.addEventListener("click", () => {

            const value = star.dataset.value;

            ratingInput.value = value;

            stars.forEach((s) => {

                s.className = "far fa-star";

                if (s.dataset.value <= value) {
                    s.className = "fas fa-star active";
                }
            });

            ratingText.innerText =
                `${value} Star Selected`;

            console.log("Rating:", value);
        });
    });


    // FORM SUBMIT
    form.addEventListener("submit", async function (e) {

        e.preventDefault();

        const formData = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            relation: document.getElementById("relation").value,
            rating: ratingInput.value,
            message: document.getElementById("feedbackMsg").value
        };

        console.log(formData);

        try {

            const response = await fetch("/feedback", 


                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {

                statusDiv.style.display = "block";

                statusDiv.innerHTML =
                    "✅ Feedback Submitted Successfully";

                form.reset();

            } else {

                statusDiv.style.display = "block";

                statusDiv.innerHTML =
                    "❌ Failed to submit feedback";
            }

        } catch (error) {

            console.log(error);

            statusDiv.style.display = "block";

            statusDiv.innerHTML =
                "❌ Server Error";
        }
    });

})();