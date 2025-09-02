<script>
  import { onMount } from "svelte";

  const BACKEND_URL = "https://mi-chatbot-backend-6vjk.onrender.com/assistant/stream";
  const DOWNLOAD_PDF_URL = "https://mi-chatbot-backend-6vjk.onrender.com/assistant/download_pdf/";

  let messages = [];
  let input = "";
  let botThinking = false;
  let menuOpen = false;
  let showWelcome = true;
  let welcomeText = "";
  let fileInput;
  let lastPdfHistoryId = null;

  const welcomeMessages = [
    "Hoy es un gran día para aprender algo nuevo!",
    "Bienvenido, ¿qué vas a crear hoy?",
    "Prepárate para explorar nuevas ideas.",
    "Cada día es una oportunidad para mejorar.",
    "Listo para generar documentos y más!",
    "Inspírate y crea algo asombroso hoy.",
    "¡Hora de ser productivo y creativo!"
  ];

  onMount(() => {
    const dayIndex = new Date().getDate() % welcomeMessages.length;
    welcomeText = welcomeMessages[dayIndex];
  });

  function addMessage(text, sender, options = {}) {
    messages = [...messages, { text, sender, id: Date.now(), ...options }];
  }

  async function sendMessage() {
    if (!input.trim() && (!fileInput || !fileInput.files.length)) return;

    if (input.trim()) addMessage(input, "user");
    let command = input;
    input = "";
    botThinking = true;
    showWelcome = false;
    lastPdfHistoryId = null;

    const formData = new FormData();
    formData.append("command", command);
    if (fileInput) {
      Array.from(fileInput.files).forEach(file =>
        formData.append("upload_files", file)
      );
      fileInput.value = "";
    }

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` }
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let botText = "";
      let images = [];

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value);
        try {
          const parsed = JSON.parse(chunk);
          if (parsed.delta) botText += parsed.delta;
          if (parsed.pdf_ready && parsed.history_id) lastPdfHistoryId = parsed.history_id;
          if (parsed.image_url) images.push(parsed.image_url);
        } catch {
          botText += chunk;
        }
        messages = messages.filter(m => m.sender !== "bot-temp");
        messages = [...messages, { text: botText, sender: "bot-temp", id: Date.now(), pdf_id: lastPdfHistoryId, images }];
      }

      botThinking = false;
      messages = messages.filter(m => m.sender !== "bot-temp");
      messages = [...messages, { text: botText, sender: "bot", id: Date.now(), pdf_id: lastPdfHistoryId, images }];
    } catch {
      botThinking = false;
      addMessage("❌ Error al conectar con el backend.", "bot");
    }
  }

  function handleFileMenu(type) {
    menuOpen = false;
    if (!fileInput) return;
    fileInput.accept = type === "file" ? ".pdf,.docx" : "image/*";
    if (type === "camera") fileInput.setAttribute("capture", "environment");
    fileInput.click();
  }

  function downloadPdf(historyId) {
    if (!historyId) return;
    const link = document.createElement("a");
    link.href = `${DOWNLOAD_PDF_URL}${historyId}`;
    link.download = "reporte.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadImage(url) {
    const link = document.createElement("a");
    link.href = url;
    link.download = "imagen.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 🚀 Incluye la versión aquí, antes estaba en otro <script>
  const version = __APP_VERSION__;
</script>
