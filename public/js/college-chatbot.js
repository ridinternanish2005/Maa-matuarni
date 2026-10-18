
(() => {
  "use strict";

  // ---------- Get HTML elements ----------
  const launcher = document.getElementById("college-ai-launcher");
  const panel = document.getElementById("college-ai-panel");
  const close = document.getElementById("college-ai-close");
  const form = document.getElementById("college-ai-form");
  const input = document.getElementById("college-ai-input");
  // ---------- Fix Space key in chatbot ----------
input.addEventListener(
  "keydown",
  function (event) {
    if (event.code === "Space" || event.key === " ") {
      event.stopImmediatePropagation();
    }
  },
  true
);
  const messages = document.getElementById("college-ai-messages");
  const send = document.getElementById("college-ai-send");
  const mic = document.getElementById("college-ai-mic");

  // Stop if the chatbot HTML is not present
  if (!launcher || !panel || !form || !input || !messages) {
    return;
  }

  // Prevent duplicate initialization if this script runs again
  if (form.dataset.chatbotInitialized === "true") {
    return;
  }
  form.dataset.chatbotInitialized = "true";

  // ---------- State ----------
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  let recognition = null;
  let listening = false;
  let isSending = false;

  const speechSupported = "speechSynthesis" in window;

  // ---------- Open / Close Chatbot ----------
  function toggleChat(open) {
    panel.classList.toggle("is-open", open);
    panel.setAttribute("aria-hidden", String(!open));
    launcher.setAttribute("aria-expanded", String(open));

    if (open) {
      window.setTimeout(() => input.focus(), 50);
    }
  }

  launcher.addEventListener("click", () => {
    toggleChat(!panel.classList.contains("is-open"));
  });

  close?.addEventListener("click", () => {
    toggleChat(false);
  });

  // ---------- Auto-resize Textarea ----------
  function resizeInput() {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 95)}px`;
  }

  input.addEventListener("input", resizeInput);

  // ---------- Safe Markdown Renderer ----------
  // Supports headings, paragraphs, bold, italic, links,
  // inline code, fenced code blocks and ordered/unordered lists.
  // Uses DOM text nodes instead of injecting raw HTML.

  function renderMarkdown(text, container) {
    container.replaceChildren();

    const source = String(text ?? "").replace(/\r\n?/g, "\n");
    const lines = source.split("\n");

    let paragraph = [];
    let list = null;
    let listType = "";
    let codeLines = [];
    let codeLanguage = "";
    let inCode = false;

    function appendInline(value, parent) {
      const pattern =
        /(`[^`\n]+`|\*\*[^*\n]+?\*\*|__[^_\n]+?__|\*[^*\n]+?\*|_[^_\n]+?_|https?:\/\/[^\s<]+)/g;

      let lastIndex = 0;
      let match;

      while ((match = pattern.exec(value)) !== null) {
        if (match.index > lastIndex) {
          parent.appendChild(
            document.createTextNode(
              value.slice(lastIndex, match.index)
            )
          );
        }

        const token = match[0];

        if (token.startsWith("`") && token.endsWith("`")) {
          const code = document.createElement("code");
          code.textContent = token.slice(1, -1);
          parent.appendChild(code);
        } else if (
          (token.startsWith("**") && token.endsWith("**")) ||
          (token.startsWith("__") && token.endsWith("__"))
        ) {
          const strong = document.createElement("strong");
          appendInline(token.slice(2, -2), strong);
          parent.appendChild(strong);
        } else if (
          (token.startsWith("*") && token.endsWith("*")) ||
          (token.startsWith("_") && token.endsWith("_"))
        ) {
          const italic = document.createElement("em");
          appendInline(token.slice(1, -1), italic);
          parent.appendChild(italic);
        } else if (/^https?:\/\//i.test(token)) {
          const cleanUrl = token.replace(/[.,!?;:)]+$/, "");
          const trailing = token.slice(cleanUrl.length);

          try {
            const url = new URL(cleanUrl);

            if (url.protocol === "http:" || url.protocol === "https:") {
              const link = document.createElement("a");
              link.href = url.href;
              link.textContent = cleanUrl;
              link.target = "_blank";
              link.rel = "noopener noreferrer";
              parent.appendChild(link);
            } else {
              parent.appendChild(document.createTextNode(cleanUrl));
            }
          } catch {
            parent.appendChild(document.createTextNode(cleanUrl));
          }

          if (trailing) {
            parent.appendChild(document.createTextNode(trailing));
          }
        }

        lastIndex = pattern.lastIndex;
      }

      if (lastIndex < value.length) {
        parent.appendChild(
          document.createTextNode(value.slice(lastIndex))
        );
      }
    }

    function flushParagraph() {
      if (!paragraph.length) return;

      const p = document.createElement("p");
      appendInline(paragraph.join(" "), p);
      container.appendChild(p);
      paragraph = [];
    }

    function flushList() {
      if (!list) return;

      container.appendChild(list);
      list = null;
      listType = "";
    }

    function flushCode() {
      const wrapper = document.createElement("div");
      wrapper.className = "college-ai-code";

      if (codeLanguage) {
        const label = document.createElement("div");
        label.className = "college-ai-code-language";
        label.textContent = codeLanguage;
        wrapper.appendChild(label);
      }

      const pre = document.createElement("pre");
      const code = document.createElement("code");

      code.textContent = codeLines.join("\n");
      pre.appendChild(code);
      wrapper.appendChild(pre);

      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "college-ai-code-copy";
      copyButton.textContent = "Copy code";

      copyButton.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(codeLines.join("\n"));
          copyButton.textContent = "Copied!";

          window.setTimeout(() => {
            copyButton.textContent = "Copy code";
          }, 1500);
        } catch {
          copyButton.textContent = "Copy unavailable";
        }
      });

      wrapper.appendChild(copyButton);
      container.appendChild(wrapper);

      codeLines = [];
      codeLanguage = "";
    }

    for (const line of lines) {
      const fence = line.match(/^\s*```([\w+#.-]*)\s*$/);

      if (fence) {
        if (inCode) {
          flushCode();
          inCode = false;
        } else {
          flushParagraph();
          flushList();
          inCode = true;
          codeLanguage = fence[1] || "";
        }

        continue;
      }

      if (inCode) {
        codeLines.push(line);
        continue;
      }

      if (!line.trim()) {
        flushParagraph();
        flushList();
        continue;
      }

      if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
        flushParagraph();
        flushList();
        container.appendChild(document.createElement("hr"));
        continue;
      }

      const heading = line.match(/^\s*(#{1,6})\s+(.+)$/);

      if (heading) {
        flushParagraph();
        flushList();

        const h = document.createElement(
          `h${Math.min(heading[1].length, 4)}`
        );

        appendInline(heading[2], h);
        container.appendChild(h);
        continue;
      }

      const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
      const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);

      if (unordered || ordered) {
        flushParagraph();

        const type = ordered ? "ol" : "ul";

        if (!list || listType !== type) {
          flushList();
          list = document.createElement(type);
          listType = type;
        }

        const li = document.createElement("li");
        appendInline((unordered || ordered)[1], li);
        list.appendChild(li);
        continue;
      }

      flushList();
      paragraph.push(line.trim());
    }

    if (inCode) {
      flushCode();
    }

    flushParagraph();
    flushList();
  }

  // ---------- Display Chat Message ----------
  function addMessage(text, role, extraClass = "") {
    const element = document.createElement("div");

    element.className =
      `college-ai-message ${role} ${extraClass}`.trim();

    if (role === "bot" && !extraClass.includes("error")) {
      renderMarkdown(text, element);
    } else {
      element.textContent = String(text ?? "");
    }

    messages.appendChild(element);
    messages.scrollTop = messages.scrollHeight;

    return element;
  }

  // ---------- Speak AI Answer ----------
  function speakAnswer(text) {
    if (!speechSupported || !text) return;

    window.speechSynthesis.cancel();

    const plainText = String(text)
      .replace(/```[\w+#.-]*\n?/g, "")
      .replace(/[`*_#]/g, "")
      .replace(/https?:\/\/\S+/g, "link")
      .replace(/^\s*[-+]\s+/gm, "")
      .replace(/^\s*\d+[.)]\s+/gm, "")
      .trim();

    if (!plainText) return;

    const utterance = new SpeechSynthesisUtterance(plainText);
    const hasHindi = /[\u0900-\u097F]/.test(plainText);

    utterance.lang = hasHindi ? "hi-IN" : "en-IN";
    utterance.rate = 1;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();

    const matchingVoice = voices.find((voice) =>
      hasHindi
        ? voice.lang.toLowerCase().startsWith("hi")
        : voice.lang.toLowerCase().startsWith("en-in")
    );

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  // ---------- Send Question to Backend ----------
  async function ask(question) {
    // Trim only the start/end of the message.
    // Spaces between words remain unchanged.
    const cleaned = String(question ?? "").trim();

    if (!cleaned || isSending) return;

    if (speechSupported) {
      window.speechSynthesis.cancel();
    }

    addMessage(cleaned, "user");

    input.value = "";
    resizeInput();

    isSending = true;

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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: cleaned
        })
      });

      const data = await response.json();
      typing.remove();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Please try again."
        );
      }

      addMessage(data.answer, "bot");
      speakAnswer(data.answer);
    } catch (error) {
      typing.remove();

      addMessage(
        error.message ||
          "Assistant is temporarily unavailable. Please try again.",
        "bot",
        "error"
      );
    } finally {
      isSending = false;

      if (send) send.disabled = false;
      if (mic) mic.disabled = false;

      input.focus();
    }
  }

  // ---------- Microphone / Voice Recognition ----------
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
      const transcript =
        event.results[0][0].transcript.trim();

      if (transcript) {
        input.value = transcript;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        ask(transcript);
      }
    };

    recognition.onerror = (event) => {
      const errors = {
        "not-allowed": "Microphone permission allow karo.",
        "no-speech": "Awaaz nahi mili. Dobara bolkar dekho.",
        network: "Voice recognition ke liye network problem hai.",
        "audio-capture": "Microphone detect nahi hua."
      };

      if (event.error !== "aborted") {
        addMessage(
          errors[event.error] ||
            "Voice recognition nahi chal saka.",
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
      if (speechSupported) {
        window.speechSynthesis.cancel();
      }

      recognition.start();
    } catch {
      addMessage(
        "Microphone start nahi hua. Dobara try karo.",
        "bot",
        "error"
      );
    }
  });

  // ---------- Form Submit ----------
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    ask(input.value);
  });

  // ---------- Keyboard Handling ----------
  input.addEventListener("keydown", (event) => {
    // Do not block Space or normal text input.
    // Enter sends; Shift + Enter inserts a new line.
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.isComposing
    ) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  // ---------- Suggested Questions ----------
  document.querySelectorAll("[data-question]").forEach((button) => {
    button.addEventListener("click", () => {
      ask(button.getAttribute("data-question") || "");
    });
  });
})();
