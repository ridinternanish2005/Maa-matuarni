
(() => {
  const launcher = document.getElementById("college-ai-launcher");
  const panel = document.getElementById("college-ai-panel");
  const close = document.getElementById("college-ai-close");
  const form = document.getElementById("college-ai-form");
  const input = document.getElementById("college-ai-input");
  const messages = document.getElementById("college-ai-messages");
  const send = document.getElementById("college-ai-send");
  const mic = document.getElementById("college-ai-mic");

  if (!launcher || !panel || !form || !input || !messages) return;

  // Browser voice features
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  let recognition = null;
  let listening = false;

  const speechSupported = "speechSynthesis" in window;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      listening = true;
      if (mic) {
        mic.textContent = "⏹";
        mic.title = "Stop listening";
        mic.setAttribute("aria-label", "Stop listening");
      }
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();

      if (transcript) {
        input.value = transcript;
        input.dispatchEvent(new Event("input"));

        // Automatically send the spoken question
        ask(transcript);
      }
    };

    recognition.onerror = (event) => {
      const errors = {
        "not-allowed": "Microphone permission allow karo.",
        "no-speech": "Awaaz nahi mili. Dobara bolkar dekho.",
        "network": "Voice recognition ke liye network problem hai.",
        "audio-capture": "Microphone detect nahi hua."
      };

      if (event.error !== "aborted") {
        addMessage(
          errors[event.error] || "Voice recognition nahi chal saka.",
          "bot",
          "error"
        );
      }
    };

    recognition.onend = () => {
      listening = false;
      if (mic) {
        mic.textContent = "🎤";
        mic.title = "Speak your question";
        mic.setAttribute("aria-label", "Speak your question");
      }
    };
  }

  function toggle(open) {
    panel.classList.toggle("is-open", open);
    panel.setAttribute("aria-hidden", String(!open));
    launcher.setAttribute("aria-expanded", String(open));

    if (open) setTimeout(() => input.focus(), 50);
  }

  launcher.addEventListener("click", () => {
    toggle(!panel.classList.contains("is-open"));
  });

  close?.addEventListener("click", () => toggle(false));

  function addMessage(text, role, extraClass = "") {
    const el = document.createElement("div");
    el.className = `college-ai-message ${role} ${extraClass}`.trim();
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  // Speak the AI answer aloud
  function speakAnswer(text) {
    if (!speechSupported || !text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Select a voice language based on the answer's script
    const hasHindi = /[\u0900-\u097F]/.test(text);
    utterance.lang = hasHindi ? "hi-IN" : "en-IN";
    utterance.rate = 1;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((voice) =>
      voice.lang.toLowerCase().startsWith(hasHindi ? "hi" : "en-in")
    );

    if (matchingVoice) utterance.voice = matchingVoice;

    window.speechSynthesis.speak(utterance);
  }

  async function ask(question) {
    const cleaned = question.trim();
    if (!cleaned) return;

    // Stop any previous spoken answer
    if (speechSupported) window.speechSynthesis.cancel();

    addMessage(cleaned, "user");
    input.value = "";
    input.style.height = "auto";

    if (send) send.disabled = true;
    if (mic) mic.disabled = true;

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

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Please try again.");
      }

      addMessage(data.answer, "bot");

      // Automatically speak the AI response
      speakAnswer(data.answer);
    } catch (err) {
      typing.remove();
      addMessage(
        err.message || "Assistant is temporarily unavailable. Please try again.",
        "bot",
        "error"
      );
    } finally {
      if (send) send.disabled = false;
      if (mic) mic.disabled = false;
      input.focus();
    }
  }

  // Microphone button
  mic?.addEventListener("click", () => {
    if (!recognition) {
      addMessage(
        "Voice recognition is not supported in this browser. Please use an updated Chrome browser.",
        "bot",
        "error"
      );
      return;
    }

    if (listening) {
      recognition.stop();
      return;
    }

    try {
      if (speechSupported) window.speechSynthesis.cancel();
      recognition.start();
    } catch (error) {
      addMessage(
        "Microphone start nahi hua. Dobara try karo.",
        "bot",
        "error"
      );
    }
  });

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
    button.addEventListener("click", () => {
      ask(button.getAttribute("data-question") || "");
    });
  });
})();
