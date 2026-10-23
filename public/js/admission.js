
document.addEventListener("DOMContentLoaded", () => {
  const mobile = document.getElementById("mobile");
  const dob = document.getElementById("dob");
  const percentage = document.getElementById("percentage");

  if (mobile) {
    mobile.addEventListener("input", () => {
      mobile.value = mobile.value.replace(/\D/g, "").slice(0, 10);
    });
  }

  if (dob) {
    const today = new Date();
    const localToday = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0")
    ].join("-");

    dob.max = localToday;
  }

  if (percentage) {
    percentage.addEventListener("input", () => {
      const value = Number(percentage.value);

      if (percentage.value !== "" && (value < 0 || value > 100)) {
        percentage.setCustomValidity(
          "Percentage must be between 0 and 100."
        );
      } else {
        percentage.setCustomValidity("");
      }
    });
  }
});
