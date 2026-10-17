(() => {
  const launcher = document.getElementById("college-ai-launcher");
  const panel = document.getElementById("college-ai-panel");
  const close = document.getElementById("college-ai-close");
  const form = document.getElementById("college-ai-form");
  const input = document.getElementById("college-ai-input");
  const messages = document.getElementById("college-ai-messages");
  const send = document.getElementById("college-ai-send");
  if (!launcher || !panel || !form || !input || !messages) return;

  function toggle(open) {
    panel.classList.toggle("is-open", open);
    panel.setAttribute("aria-hidden", String(!open));
    launcher.setAttribute("aria-expanded", String(open));
    if (open) setTimeout(() => input.focus(), 50);
  }
  launcher.addEventListener("click", () => toggle(!panel.classList.contains("is-open")));
  close?.addEventListener("click", () => toggle(false));

  function addMessage(text, role, extraClass = "") {
    const el = document.createElement("div");
    el.className = `college-ai-message ${role} ${extraClass}`.trim();
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }
  async function ask(question) {
    const cleaned = question.trim();
    if (!cleaned) return;
    addMessage(cleaned, "user");
    input.value = "";
    input.style.height = "auto";
    send.disabled = true;
    const typing = document.createElement("div");
    typing.className = "college-ai-typing";
    typing.textContent = "Assistant is thinking…";
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
    try {
      const response = await fetch("/api/college-assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: cleaned })
      });
      const data = await response.json();
      typing.remove();
      if (!response.ok || !data.success) throw new Error(data.message || "Please try again.");
      addMessage(data.answer, "bot");
    } catch (err) {
      typing.remove();
      addMessage(err.message || "Assistant is temporarily unavailable. Please try again.", "bot", "error");
    } finally {
      send.disabled = false;
      input.focus();
    }
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    ask(input.value);
  });
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 95)}px`;
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  document.querySelectorAll("[data-question]").forEach((button) => {
    button.addEventListener("click", () => ask(button.getAttribute("data-question") || ""));
  });
})();
