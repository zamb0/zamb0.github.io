---
#title: AI Chat
layout: page
---

{{< rawhtml >}}
<div id="chat-container">
  <div id="chat-status" class="status-box">
    <div class="status-content">
      <div class="status-icon">🤖</div>
      <div class="status-text">
        <h3>Local AI Chat</h3>
        <p>Chat with an AI model running entirely in your browser using WebGPU</p>
        <button id="load-model-btn" class="primary-button">Load Model</button>
        <div id="loading-info" class="loading-info" style="display: none;">
          <div class="loading-spinner-container">
            <div class="spinner"></div>
            <span id="loading-text">Loading...</span>
          </div>
          <div class="progress-bar-container" id="progress-bar-container">
            <div class="progress-bar" id="progress-bar"></div>
          </div>
          <span class="progress-text" id="progress-text">0%</span>
        </div>
      </div>
    </div>
  </div>

  <div id="chat-interface" style="display: none;">
    <div id="chat-messages" class="chat-messages"></div>

    <div class="chat-input-container">
      <textarea 
        id="chat-input" 
        class="chat-input" 
        placeholder="Type a message..."
        rows="1"
      ></textarea>
      <button id="send-btn" class="send-button">
        <span>Send</span>
        <span class="send-icon">➤</span>
      </button>
    </div>
  </div>
</div>
{{< /rawhtml >}}

{{< rawhtml >}}
<style>
  #chat-container {
    max-width: 900px;
    margin: 2rem auto;
    padding: 0 1rem;
  }

  .status-box {
    background: var(--entry);
    border-radius: 16px;
    padding: 3rem 2rem;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--border);
  }

  .status-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .status-icon {
    font-size: 4rem;
  }

  .status-text {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .status-text h3 {
    margin: 0 0 0.5rem 0;
    color: var(--primary);
    font-size: 1.8rem;
  }

  .status-text p {
    margin: 0 0 1.5rem 0;
    color: var(--secondary);
    font-size: 1rem;
    max-width: 500px;
  }

  .primary-button {
    background: var(--primary);
    color: white;
    border: none;
    padding: 12px 32px;
    border-radius: 24px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .primary-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  .primary-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .loading-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-top: 1rem;
    width: 100%;
    max-width: 400px;
    text-align: center;
  }

  .loading-spinner-container {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 3px solid var(--border);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  #loading-text {
    color: var(--secondary);
    font-size: 0.9rem;
    text-align: center;
  }

  .progress-bar-container {
    width: 100%;
    height: 8px;
    background: var(--border);
    border-radius: 4px;
    overflow: hidden;
    display: none;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--primary), var(--tertiary));
    border-radius: 4px;
    transition: width 0.3s ease;
    width: 0%;
  }

  .progress-text {
    font-size: 0.85rem;
    color: var(--primary);
    font-weight: 600;
    display: none;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  #chat-interface {
    display: flex;
    flex-direction: column;
    height: 600px;
    background: var(--entry);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--border);
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .message {
    display: flex;
    gap: 0.75rem;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .message.user {
    flex-direction: row-reverse;
  }

  .message-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  .message.user .message-avatar {
    background: var(--primary);
  }

  .message.assistant .message-avatar {
    background: var(--secondary);
  }

  .message-content {
    max-width: 70%;
    padding: 12px 16px;
    border-radius: 12px;
    line-height: 1.5;
  }

  .message.user .message-content {
    background: var(--primary);
    color: white;
    border-bottom-right-radius: 4px;
  }

  .message.assistant .message-content {
    background: var(--code-bg);
    color: var(--content);
    border-bottom-left-radius: 4px;
  }

  .chat-input-container {
    padding: 1rem;
    background: var(--theme);
    border-top: 1px solid var(--border);
    display: flex;
    gap: 0.75rem;
  }

  .chat-input {
    flex: 1;
    padding: 12px 16px;
    border: 2px solid var(--border);
    border-radius: 12px;
    background: var(--entry);
    color: var(--content);
    font-family: inherit;
    font-size: 0.95rem;
    resize: none;
    min-height: 44px;
    max-height: 120px;
    transition: border-color 0.3s ease;
  }

  .chat-input:focus {
    outline: none;
    border-color: var(--primary);
  }

  .send-button {
    padding: 0 20px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
  }

  .send-button:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  /* Animazione puntini di caricamento */
  .typing-indicator {
    display: inline-block;
  }

  .typing-indicator::after {
    content: '';
    animation: typing-dots 1.5s infinite;
  }

  @keyframes typing-dots {
    0%, 20% { content: '.'; }
    40% { content: '..'; }
    60%, 100% { content: '...'; }
  }

  @media (max-width: 768px) {
    #chat-interface {
      height: 500px;
    }

    .message-content {
      max-width: 85%;
    }

    .status-box {
      padding: 2rem 1rem;
    }
  }
</style>

<script type="module">
  import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.5';

  // Configura per usare i modelli locali
  env.allowLocalModels = false;
  env.useBrowserCache = true;

  let generator = null;
  let isGenerating = false;
  let conversationHistory = [];

  let loadModelBtn, loadingInfo, loadingText, chatStatus, chatInterface, chatMessages, chatInput, sendBtn;
  let progressBar, progressBarContainer, progressText;

  /**
   * Inizializza gli elementi del DOM
   */
  function initializeElements() {
    loadModelBtn = document.getElementById('load-model-btn');
    loadingInfo = document.getElementById('loading-info');
    loadingText = document.getElementById('loading-text');
    chatStatus = document.getElementById('chat-status');
    chatInterface = document.getElementById('chat-interface');
    chatMessages = document.getElementById('chat-messages');
    chatInput = document.getElementById('chat-input');
    sendBtn = document.getElementById('send-btn');
    progressBar = document.getElementById('progress-bar');
    progressBarContainer = document.getElementById('progress-bar-container');
    progressText = document.getElementById('progress-text');
  }

  /**
   * Carica e inizializza il modello
   */
  async function initializeModel() {
    try {
      loadModelBtn.style.display = 'none';
      loadingInfo.style.display = 'flex';
      loadingText.textContent = 'Initializing...';

      const model_id = 'onnx-community/granite-4.0-micro-ONNX-web';

      generator = await pipeline(
        'text-generation',
        model_id,
        {
          dtype: 'auto',
          device: 'webgpu',
          progress_callback: (data) => {
            if (data.status === 'progress') {
              const progressPercent = Math.round(data.progress);
              const fileName = data.file?.split('/').pop() || 'file';
              
              // Mostra barra di progresso e percentuale
              progressBarContainer.style.display = 'block';
              progressText.style.display = 'block';
              progressBar.style.width = progressPercent + '%';
              progressText.textContent = progressPercent + '%';
              
              loadingText.textContent = `Downloading: ${fileName}`;
            } else if (data.status === 'done') {
              loadingText.textContent = 'Initializing model...';
              progressBarContainer.style.display = 'none';
              progressText.style.display = 'none';
            } else if (data.status === 'ready') {
              loadingText.textContent = 'Model ready!';
            }
          }
        }
      );

      // Modello caricato con successo
      chatStatus.style.display = 'none';
      chatInterface.style.display = 'flex';

      // Attendi un frame per permettere il rendering
      setTimeout(() => {
        if (chatInput) chatInput.focus();
      }, 100);

      addMessage('assistant', 'Hi! I\'m Granite 4.0 H Tiny, an AI assistant running in your browser. How can I help you?');

    } catch (error) {
      console.error(error);
      loadingInfo.style.display = 'none';
      loadModelBtn.style.display = 'block';
      loadingText.textContent = 'Errore: ' + error.message;

      // Fallback CPU se WebGPU non disponibile
      if (error.message.includes('WebGPU') || error.message.includes('webgpu')) {
        const useCPU = confirm('WebGPU is not available. Do you want to use CPU instead? (slower but functional)');
        if (useCPU) {
          loadModelWithCPU();
        }
      } else {
        alert('Unable to load the model. Check the console for details.\n\nError: ' + error.message);
      }
    }
  }

  /**
   * Carica il modello usando CPU come fallback
   */
  async function loadModelWithCPU() {
    try {
      loadModelBtn.style.display = 'none';
      loadingInfo.style.display = 'flex';
      loadingText.textContent = 'Loading model (CPU)...';

      const model_id = 'ibm-granite/granite-4.0-h-tiny';

      generator = await pipeline(
        'text-generation',
        model_id,
        {
          dtype: 'auto',
          device: 'wasm',
          progress_callback: (data) => {
            if (data.status === 'progress') {
              const progressPercent = Math.round(data.progress);
              const fileName = data.file?.split('/').pop() || 'file';
              
              // Mostra barra di progresso e percentuale
              progressBarContainer.style.display = 'block';
              progressText.style.display = 'block';
              progressBar.style.width = progressPercent + '%';
              progressText.textContent = progressPercent + '%';
              
              loadingText.textContent = `Downloading: ${fileName}`;
            } else if (data.status === 'done') {
              loadingText.textContent = 'Initializing...';
              progressBarContainer.style.display = 'none';
              progressText.style.display = 'none';
            }
          }
        }
      );

      chatStatus.style.display = 'none';
      chatInterface.style.display = 'flex';

      // Attendi un frame per permettere il rendering
      setTimeout(() => {
        if (chatInput) chatInput.focus();
      }, 100);

      addMessage('assistant', 'Hi! I\'m using the CPU, so I might be a bit slower. How can I help you?');
    } catch (error) {
      console.error(error);
      loadingInfo.style.display = 'none';
      loadModelBtn.style.display = 'block';
      alert('Unable to load the model even with CPU.\n\nError: ' + error.message);
    }
  }

  /**
   * Aggiungi messaggio alla chat
   */
  function addMessage(role, content) {
    if (!chatMessages) {
      console.error('chatMessages not found!');
      return;
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? '👤' : '🤖';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);

    // Scroll automatico
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  /**
   * Costruisci il prompt formattato
   */
  function buildPrompt(userMessage) {
    // Formato Granite: <|user|>\n{message}\n<|assistant|>\n
    let prompt = '';

    // Aggiungi storia recente (max 4 scambi)
    const recentHistory = conversationHistory.slice(-8);
    for (const msg of recentHistory) {
      if (msg.role === 'user') {
        prompt += `<|user|>\n${msg.content}\n`;
      } else {
        prompt += `<|assistant|>\n${msg.content}\n`;
      }
    }

    // Aggiungi nuovo messaggio
    prompt += `<|user|>\n${userMessage}\n<|assistant|>\n`;
    return prompt;
  }

  /**
   * Mostra indicatore di digitazione
   */
  function showTypingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant typing-message';
    messageDiv.id = 'typing-indicator-msg';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '🤖';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = '<span class="typing-indicator"></span>';

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);

    // Scroll automatico
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  /**
   * Rimuovi indicatore di digitazione
   */
  function hideTypingIndicator() {
    const typingMsg = document.getElementById('typing-indicator-msg');
    if (typingMsg) {
      typingMsg.remove();
    }
  }

  /**
   * Invia messaggio e genera risposta
   */
  async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message || isGenerating || !generator) return;

    // Aggiungi messaggio utente
    addMessage('user', message);
    conversationHistory.push({ role: "user", content: message });

    chatInput.value = '';
    chatInput.style.height = 'auto';

    isGenerating = true;
    sendBtn.disabled = true;
    sendBtn.textContent = 'Generating...';

    // Mostra indicatore di digitazione
    showTypingIndicator();

    try {
      const prompt = buildPrompt(message);

      // Genera risposta
      const output = await generator(prompt, {
        max_new_tokens: 512,
        temperature: 0.7,
        do_sample: true,
        top_k: 50,
        top_p: 0.95,
      });

      // Nascondi indicatore di digitazione
      hideTypingIndicator();

      // Estrai solo la risposta
      let assistantMessage = output[0].generated_text;
      assistantMessage = assistantMessage.substring(prompt.length).trim();

      // Pulisci output
      assistantMessage = assistantMessage.split('<|user|>')[0].trim();
      assistantMessage = assistantMessage.split('<|assistant|>')[0].trim();
      assistantMessage = assistantMessage.split('<|endoftext|>')[0].trim();

      if (assistantMessage) {
        addMessage('assistant', assistantMessage);
        conversationHistory.push({ role: "assistant", content: assistantMessage });

        // Limita storia
        if (conversationHistory.length > 8) {
          conversationHistory = conversationHistory.slice(-8);
        }
      } else {
        addMessage('assistant', 'Sorry, I didn\'t understand. Can you rephrase that?');
      }

    } catch (error) {
      hideTypingIndicator();
      console.error('Errore nella generazione:', error);
      addMessage('assistant', 'An error occurred: ' + error.message);
    } finally {
      isGenerating = false;
      sendBtn.disabled = false;
      sendBtn.innerHTML = '<span>Send</span><span class="send-icon">➤</span>';
      if (chatInput) chatInput.focus();
    }
  }

  // Event listeners - inizializza solo dopo DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Chat AI inizializzata');

    // Inizializza gli elementi del DOM
    initializeElements();

    // Aggiungi event listeners
    loadModelBtn.addEventListener('click', initializeModel);
    sendBtn.addEventListener('click', sendMessage);

    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Auto-resize textarea
    chatInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
  });
</script>
{{< /rawhtml >}}
