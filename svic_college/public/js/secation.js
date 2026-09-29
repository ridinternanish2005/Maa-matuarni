
  // Enhanced interactive functions with colorful toasts
  function showNotice(message) {
    const toast = document.getElementById('toastMsg');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // Modal handling
  const modal = document.getElementById('registerModal');

  function openRegisterModal() {
    modal.classList.add('active');
  }

  function closeRegisterModal() {
    modal.classList.remove('active');
  }

  function submitRegistration() {
    const name = document.getElementById('regName').value.trim();
    const className = document.getElementById('regClass').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    if (!name || !className || !phone) {
      showNotice('⚠️ Please fill Name, Class, and Phone number to register.');
      return;
    }
    showNotice(`🎉 Thank you ${name}! Registration for ${className} received. Our team will contact you.`);
    closeRegisterModal();
    // reset fields
    document.getElementById('regName').value = '';
    document.getElementById('regClass').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPhone').value = '';
  }

  // Send message from contact form
  function sendMessage() {
    const name = document.getElementById('msgName')?.value.trim();
    const email = document.getElementById('msgEmail')?.value.trim();
    const phone = document.getElementById('msgPhone')?.value.trim();
    const msg = document.getElementById('msgText')?.value.trim();
    if (!name || !email || !msg) {
      showNotice('📝 Please enter Name, Email and your Message.');
      return;
    }
    if (!email.includes('@')) {
      showNotice('✉️ Please provide a valid email address.');
      return;
    }
    showNotice(`✨ Thanks ${name}! Your message has been sent. We'll reply soon.`);
    // clear fields optionally
    document.getElementById('msgName').value = '';
    document.getElementById('msgEmail').value = '';
    document.getElementById('msgPhone').value = '';
    document.getElementById('msgText').value = '';
  }

  // close modal if click outside
  window.onclick = function(event) {
    if (event.target === modal) {
      closeRegisterModal();
    }
  }

  // Additional interactive feature: class cards dynamic style, highlight on any view details already covered.
  // Also make sure all buttons/links interactive.
  console.log("SVIC Inter College - colorful, responsive & interactive ready");

  // Optional: smooth interaction for social icons and prevent default anchor behavior
  document.querySelectorAll('.social-icons a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showNotice('🚀 Connect with us on social media for updates!');
    });
  });

  // Notice list items already covered, but also any extra optional 'View Details' on class cards trigger notice
  // No extra required, already provided via onclick.
