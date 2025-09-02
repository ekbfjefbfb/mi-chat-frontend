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
</script>

<style>
  @import './chatAnimations.css';

  .chat-container { display:flex; flex-direction:column; height:100vh; background: linear-gradient(to bottom, #1f2937, #111827); color:white; font-family: 'Segoe UI', sans-serif; }
  .chat-box { flex:1; overflow-y:auto; padding:1rem; display:flex; flex-direction:column; gap:0.5rem; }
  .message { max-width:75%; padding:0.5rem 1rem; border-radius:15px; word-wrap: break-word; cursor: default; transition: transform 0.2s; }
  .message:hover { transform: scale(1.02); }
  .user { background:#4f46e5; align-self:flex-end; }
  .bot { background:#374151; align-self:flex-start; }
  .pdf-message { background:#059669; align-self:flex-start; cursor:pointer; font-weight:bold; transition: background 0.2s; }
  .pdf-message:hover { background:#10b981; }
  .image-message img { max-width:200px; border-radius:10px; cursor:pointer; transition: transform 0.2s; }
  .image-message img:hover { transform: scale(1.05); }

  .input-footer { display:flex; gap:0.5rem; padding:0.5rem; background:#111827; align-items:center; }
  input { flex:1; padding:0.5rem 1rem; border-radius:10px; border:none; outline:none; background:#1f2937; color:#fff; }
  button { padding:0.5rem 1rem; border-radius:10px; border:none; background:#10b981; color:#fff; cursor:pointer; transition: background 0.2s; }
  button:hover { background:#059669; }
  .dot { width:8px; height:8px; border-radius:50%; background:white; display:inline-block; }
</style>

<div class="chat-container">
  {#if showWelcome}
    <div class="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
      <h2 class="text-gray-400 animate-fade-in">{welcomeText}</h2>
    </div>
  {/if}

  <div class="flex items-center justify-between p-4 bg-gray-900 z-10">
    <h1 class="text-xl font-bold">X-AI</h1>
    <button on:click={() => menuOpen = !menuOpen} class="px-3 py-2 bg-gray-700 rounded">📂</button>
  </div>

  <div class="chat-box">
    {#each messages as m (m.id)}
      {#if m.pdf_id}
        <div class="message pdf-message" on:click={() => downloadPdf(m.pdf_id)}>
          📄 {m.text} (Toca para descargar PDF)
        </div>
      {:else if m.images && m.images.length}
        {#each m.images as imgUrl}
          <div class="message bot image-message">
            <img src={imgUrl} alt="IA" on:click={() => downloadImage(imgUrl)} />
          </div>
        {/each}
      {:else}
        <div class="message {m.sender}">{m.text}</div>
      {/if}
    {/each}

    {#if botThinking}
      <div class="flex gap-1 self-start">
        <span class="dot animate-bounce-delay"></span>
        <span class="dot animate-bounce-delay delay-150"></span>
        <span class="dot animate-bounce-delay delay-300"></span>
      </div>
    {/if}
  </div>

  <div class="input-footer">
    <button on:click={() => menuOpen = !menuOpen} class="px-3 py-2 bg-gray-700 rounded-l">📎</button>
    <input type="text" placeholder="Escribe un mensaje..." bind:value={input} on:keydown={(e) => e.key === "Enter" && sendMessage()} />
    <button on:click={sendMessage} class="px-3 py-2 bg-green-600 rounded-r">➡️</button>
    <input bind:this={fileInput} type="file" multiple class="hidden" />
  </div>

  {#if menuOpen}
    <div class="absolute bottom-16 left-4 flex flex-col bg-gray-800 p-2 rounded-md z-50">
      <button on:click={() => handleFileMenu("gallery")} class="py-1 px-2 hover:bg-gray-700">Galería</button>
      <button on:click={() => handleFileMenu("camera")} class="py-1 px-2 hover:bg-gray-700">Cámara</button>
      <button on:click={() => handleFileMenu("file")} class="py-1 px-2 hover:bg-gray-700">Archivos (PDF/Word)</button>
    </div>
  {/if}
</div>
