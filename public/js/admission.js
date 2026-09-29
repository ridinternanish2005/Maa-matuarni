const admissionForm = document.getElementById("admissionForm");

if (admissionForm) {
  admissionForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(admissionForm);

    const data = {
      fullName: formData.get("fullName"),
      fatherName: formData.get("fatherName"),
      mobile: formData.get("mobile"),
      email: formData.get("email"),
      dob: formData.get("dob"),
      gender: formData.get("gender"),
      address: formData.get("address"),
      course: formData.get("course"),
      percentage: Number(formData.get("percentage"))
    };

    console.log("Sending:", data);

    try {
      const response = await fetch("/api/admissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      console.log("Response:", result);

      if (!response.ok) {
        throw new Error(result.message || "Submission failed");
      }

      alert("Admission submitted successfully!");

      admissionForm.reset();

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  });
}