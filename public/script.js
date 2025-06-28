document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const chatBox = document.getElementById('chat-box');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const loadingIndicator = document.getElementById('loading-indicator');

    // --- CONFIGURATION - All secrets are now on the backend! ---
    const API_URL = '/api/chat'; // CHANGE 1: This now points to our own backend server endpoint

    // We can keep the system instruction here and send it to the backend
    const SYSTEM_INSTRUCTION = `You are a Data Structure and Algorithm Instructor. You will only reply to the problem related to
      Data Structures and Algorithm. You have to solve query of user in simplest way.
      If user ask any question which is not related to Data Structures and Algorithm, reply him rudely.
      Example: If user asks, 'How are you?'
      You will reply: This question is not related to Data Structures and Algorithm. Kindly ask me a sensible question only.
      If the Question is related to Data Structures and Algorithm then reply him politely with a simple explanation and provide code examples in C++ when requested. Format code blocks using markdown's triple backticks.`;

    // --- Event Listener for Form Submission ---
    chatForm.addEventListener('submit', handleChatSubmit);

    async function handleChatSubmit(e) {
        e.preventDefault();
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        addMessage(userMessage, 'user');
        userInput.value = '';
        
        loadingIndicator.classList.remove('hidden');
        scrollToBottom();

        try {
            // CHANGE 2: The fetch call is now much simpler and more secure
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // We send the user's message to our backend
                body: JSON.stringify({
                    userMessage: userMessage,
                    systemInstruction: SYSTEM_INSTRUCTION 
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // The backend will forward a structured error message
                throw new Error(data.error || `API Error: ${response.status}`);
            }
            
            // CHANGE 3: The response structure from our backend is the same as Google's, so this part remains the same!
            const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (aiResponse) {
                addMessage(aiResponse, 'ai');
            } else {
                addMessage("I couldn't generate a response. Please try again.", 'ai');
            }

        } catch (error) {
            console.error("Error fetching from API:", error);
            addMessage(`Error: ${error.message}. Please check your API key setup on the server and network connection.`, 'ai');
        } finally {
            loadingIndicator.classList.add('hidden');
            scrollToBottom();
        }
    }

    // --- Helper Functions (These remain unchanged) ---

    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);

        const contentElement = document.createElement('div');
        contentElement.classList.add('message-content');
        
        contentElement.innerHTML = formatMessageContent(text);

        messageElement.appendChild(contentElement);
        chatBox.appendChild(messageElement);

        contentElement.querySelectorAll('pre code').forEach(highlightCode);

        scrollToBottom();
    }

    function formatMessageContent(text) {
        const sanitizedText = text.replace(/</g, "<").replace(/>/g, ">");
        const formattedText = sanitizedText.replace(/```(?:cpp|c\+\+)?\n([\s\S]*?)```/g, 
            (match, code) => `<pre><code class="language-cpp">${code.trim()}</code></pre>`
        );
        return formattedText.replace(/\n/g, '<br>');
    }
    
    function highlightCode(block) {
        let code = block.innerHTML;
        code = code.replace(/(<#include.*?>)/g, '<span class="code-preprocessor">$1</span>');
        code = code.replace(/(\/\/.*?)<br>/g, '<span class="code-comment">$1</span><br>');
        const keywords = ['int', 'void', 'class', 'struct', 'if', 'else', 'for', 'while', 'return', 'new', 'delete', 'public', 'private', 'protected', 'const', 'nullptr'];
        const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
        code = code.replace(keywordRegex, '<span class="code-keyword">$1</span>');
        const types = ['string', 'vector', 'cout', 'cin', 'endl', 'std'];
        const typeRegex = new RegExp(`\\b(${types.join('|')})\\b`, 'g');
        code = code.replace(typeRegex, '<span class="code-type">$1</span>');
        block.innerHTML = code;
    }

    function scrollToBottom() {
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});