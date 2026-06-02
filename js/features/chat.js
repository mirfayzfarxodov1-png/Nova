// ============================================
// NOVA - CHAT.JS (Instagram style xabarlar)
// ============================================

(function() {
    "use strict";
    
    let currentChatId = null;
    let currentChatUser = null;
    let messageInput = null;
    let mediaRecorder = null;
    let audioChunks = [];
    let isRecording = false;
    
    // ===== SHOW CHAT =====
    window.showChat = function() {
        const modal = document.getElementById('chatModal');
        const usersDiv = document.getElementById('chatUsers');
        const others = Object.values(window.appState.users).filter(u => u.id !== window.appState.currentUser.id);
        
        usersDiv.innerHTML = others.map(user => `
            <div class="chat-user-item" data-user-id="${user.id}" style="display: flex; align-items: center; gap: 15px; padding: 12px; cursor: pointer; border-bottom: 1px solid #1a1a1a; transition: background 0.2s;">
                <div style="position: relative;">
                    <img src="${user.avatar}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;" onerror="this.src='https://ui-avatars.com/api/?background=FF0000&color=fff&name=User'">
                    <div style="position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px; background: #00cc00; border-radius: 50%; border: 2px solid #000;"></div>
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 600;">${window.escapeHtml(user.name)}</div>
                    <div style="font-size: 12px; color: #888;">${window.appState.followers[user.id]?.length || 0} obunachi</div>
                </div>
                <i class="fas fa-chevron-right" style="color: #888;"></i>
            </div>
        `).join('');
        
        document.querySelectorAll('.chat-user-item').forEach(el => {
            el.onclick = () => {
                const userId = el.dataset.userId;
                openChat(userId, window.appState.users[userId].name);
            };
        });
        
        document.getElementById('chatUsers').style.display = 'block';
        document.getElementById('chatArea').style.display = 'none';
        modal.style.display = 'flex';
    };
    
    // ===== OPEN CHAT =====
    function openChat(otherUserId, otherUserName) {
        const chatId = [window.appState.currentUser.id, otherUserId].sort().join('_');
        currentChatId = chatId;
        currentChatUser = { id: otherUserId, name: otherUserName };
        
        if (!window.appState.chats.find(c => c.id === chatId)) {
            window.appState.chats.push({
                id: chatId,
                participants: [window.appState.currentUser.id, otherUserId],
                createdAt: new Date().toISOString()
            });
        }
        
        if (!window.appState.messages[chatId]) {
            window.appState.messages[chatId] = [];
        }
        
        renderChatMessages();
        
        document.getElementById('chatUsers').style.display = 'none';
        document.getElementById('chatArea').style.display = 'flex';
        
        // Update header
        const chatHeader = document.querySelector('#chatArea .chat-header');
        if (!chatHeader) {
            const header = document.createElement('div');
            header.className = 'chat-header';
            header.style.cssText = 'display: flex; align-items: center; gap: 15px; padding: 15px; border-bottom: 1px solid #1a1a1a;';
            header.innerHTML = `
                <button id="backToChatList" style="background: none; border: none; color: #fff; font-size: 20px; cursor: pointer;">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <img id="chatHeaderAvatar" src="${window.appState.users[otherUserId].avatar}" style="width: 40px; height: 40px; border-radius: 50%;">
                <div>
                    <div style="font-weight: 600;">${window.escapeHtml(otherUserName)}</div>
                    <div style="font-size: 11px; color: #888;">Online</div>
                </div>
                <button id="chatInfoBtn" style="background: none; border: none; color: #fff; font-size: 20px; cursor: pointer; margin-left: auto;">
                    <i class="fas fa-info-circle"></i>
                </button>
            `;
            document.getElementById('chatMessages').parentNode.insertBefore(header, document.getElementById('chatMessages'));
            
            document.getElementById('backToChatList').onclick = () => {
                document.getElementById('chatUsers').style.display = 'block';
                document.getElementById('chatArea').style.display = 'none';
                document.querySelector('.chat-header')?.remove();
            };
        }
        
        // Setup message input with attachments
        setupChatInput();
    }
    
    // ===== SETUP CHAT INPUT (Instagram style) =====
    function setupChatInput() {
        const inputContainer = document.querySelector('.chat-input');
        if (!inputContainer) return;
        
        inputContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #1a1a1a; border-radius: 25px;">
                <button id="chatAttachBtn" style="background: none; border: none; color: #ff0000; font-size: 20px; cursor: pointer;">
                    <i class="fas fa-plus-circle"></i>
                </button>
                <input type="text" id="chatInput" placeholder="Xabar yozing..." style="flex: 1; background: none; border: none; color: #fff; outline: none; padding: 8px 0;">
                <button id="chatEmojiBtn" style="background: none; border: none; color: #888; font-size: 20px; cursor: pointer;">
                    <i class="fas fa-smile"></i>
                </button>
                <button id="chatMicBtn" style="background: none; border: none; color: #ff0000; font-size: 20px; cursor: pointer;">
                    <i class="fas fa-microphone"></i>
                </button>
                <button id="chatSendBtn" style="background: #ff0000; border: none; color: #fff; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: none;">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
            <div id="chatAttachMenu" style="display: none; position: absolute; bottom: 70px; left: 10px; background: #1a1a1a; border-radius: 20px; padding: 15px; z-index: 100;">
                <div style="display: flex; gap: 20px;">
                    <div id="attachGallery" style="text-align: center; cursor: pointer;">
                        <div style="width: 50px; height: 50px; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-image" style="font-size: 24px;"></i>
                        </div>
                        <div style="font-size: 11px; margin-top: 5px;">Galereya</div>
                    </div>
                    <div id="attachCamera" style="text-align: center; cursor: pointer;">
                        <div style="width: 50px; height: 50px; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-camera" style="font-size: 24px;"></i>
                        </div>
                        <div style="font-size: 11px; margin-top: 5px;">Kamera</div>
                    </div>
                    <div id="attachLocation" style="text-align: center; cursor: pointer;">
                        <div style="width: 50px; height: 50px; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-map-marker-alt" style="font-size: 24px;"></i>
                        </div>
                        <div style="font-size: 11px; margin-top: 5px;">Lokatsiya</div>
                    </div>
                </div>
            </div>
            <div id="recordingStatus" style="display: none; align-items: center; gap: 10px; padding: 10px; background: #1a1a1a; border-radius: 25px;">
                <div style="width: 12px; height: 12px; background: #ff0000; border-radius: 50%; animation: pulse 1s infinite;"></div>
                <span>Yozilmoqda...</span>
                <span id="recordingTimer">0:00</span>
                <button id="stopRecordingBtn" style="background: #ff0000; border: none; padding: 5px 15px; border-radius: 20px; color: #fff; cursor: pointer;">To'xtatish</button>
            </div>
        `;
        
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('chatSendBtn');
        const attachBtn = document.getElementById('chatAttachBtn');
        const attachMenu = document.getElementById('chatAttachMenu');
        const micBtn = document.getElementById('chatMicBtn');
        const recordingStatus = document.getElementById('recordingStatus');
        
        // Show send button when typing
        if (chatInput) {
            chatInput.oninput = () => {
                sendBtn.style.display = chatInput.value.trim() ? 'flex' : 'none';
                micBtn.style.display = chatInput.value.trim() ? 'none' : 'flex';
            };
        }
        
        // Send message
        if (sendBtn) {
            sendBtn.onclick = () => {
                if (chatInput && chatInput.value.trim()) {
                    sendMessage(chatInput.value.trim());
                    chatInput.value = '';
                    sendBtn.style.display = 'none';
                    micBtn.style.display = 'flex';
                }
            };
        }
        
        // Enter key
        if (chatInput) {
            chatInput.onkeypress = (e) => {
                if (e.key === 'Enter' && chatInput.value.trim()) {
                    sendMessage(chatInput.value.trim());
                    chatInput.value = '';
                    sendBtn.style.display = 'none';
                    micBtn.style.display = 'flex';
                }
            };
        }
        
        // Attach menu
        if (attachBtn) {
            attachBtn.onclick = () => {
                attachMenu.style.display = attachMenu.style.display === 'none' ? 'block' : 'none';
            };
        }
        
        // Gallery attachment
        const attachGallery = document.getElementById('attachGallery');
        if (attachGallery) {
            attachGallery.onclick = () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*,video/*';
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        sendMediaMessage(file);
                    }
                };
                input.click();
                attachMenu.style.display = 'none';
            };
        }
        
        // Voice recording
        if (micBtn) {
            micBtn.onclick = async () => {
                if (!isRecording) {
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        mediaRecorder = new MediaRecorder(stream);
                        audioChunks = [];
                        
                        mediaRecorder.ondataavailable = (event) => {
                            audioChunks.push(event.data);
                        };
                        
                        mediaRecorder.onstop = () => {
                            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                            sendAudioMessage(audioBlob);
                            stream.getTracks().forEach(track => track.stop());
                            recordingStatus.style.display = 'none';
                            inputContainer.style.display = 'flex';
                            isRecording = false;
                        };
                        
                        mediaRecorder.start();
                        isRecording = true;
                        inputContainer.style.display = 'none';
                        recordingStatus.style.display = 'flex';
                        
                        // Timer
                        let seconds = 0;
                        const timer = setInterval(() => {
                            if (!isRecording) {
                                clearInterval(timer);
                                return;
                            }
                            seconds++;
                            const mins = Math.floor(seconds / 60);
                            const secs = seconds % 60;
                            const timerSpan = document.getElementById('recordingTimer');
                            if (timerSpan) timerSpan.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
                        }, 1000);
                        
                        document.getElementById('stopRecordingBtn').onclick = () => {
                            if (mediaRecorder && mediaRecorder.state === 'recording') {
                                mediaRecorder.stop();
                                clearInterval(timer);
                            }
                        };
                        
                    } catch (err) {
                        window.showToast("❌ Mikrofon ruxsatini bering!");
                    }
                }
            };
        }
        
        // Close attach menu on click outside
        document.addEventListener('click', (e) => {
            if (attachMenu && !attachBtn.contains(e.target) && !attachMenu.contains(e.target)) {
                attachMenu.style.display = 'none';
            }
        });
    }
    
    // ===== SEND TEXT MESSAGE =====
    function sendMessage(text) {
        const newMessage = {
            id: Date.now(),
            senderId: window.appState.currentUser.id,
            senderName: window.appState.currentUser.name,
            senderAvatar: window.appState.currentUser.avatar,
            text: text,
            type: 'text',
            time: new Date().toLocaleString(),
            reactions: []
        };
        
        window.appState.messages[currentChatId].push(newMessage);
        window.saveData();
        renderChatMessages();
        
        // Simulate typing indicator
        showTypingIndicator();
        
        // Auto-reply (for demo)
        setTimeout(() => {
            const autoReply = {
                id: Date.now() + 1,
                senderId: currentChatUser.id,
                senderName: currentChatUser.name,
                senderAvatar: window.appState.users[currentChatUser.id]?.avatar,
                text: "Xabaringiz qabul qilindi! 😊",
                type: 'text',
                time: new Date().toLocaleString(),
                reactions: []
            };
            window.appState.messages[currentChatId].push(autoReply);
            window.saveData();
            renderChatMessages();
        }, 2000);
    }
    
    // ===== SEND MEDIA MESSAGE =====
    function sendMediaMessage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const type = file.type.startsWith('image/') ? 'image' : 'video';
            const newMessage = {
                id: Date.now(),
                senderId: window.appState.currentUser.id,
                senderName: window.appState.currentUser.name,
                senderAvatar: window.appState.currentUser.avatar,
                mediaUrl: e.target.result,
                mediaType: type,
                type: 'media',
                time: new Date().toLocaleString(),
                reactions: []
            };
            window.appState.messages[currentChatId].push(newMessage);
            window.saveData();
            renderChatMessages();
        };
        reader.readAsDataURL(file);
    }
    
    // ===== SEND AUDIO MESSAGE =====
    function sendAudioMessage(audioBlob) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const newMessage = {
                id: Date.now(),
                senderId: window.appState.currentUser.id,
                senderName: window.appState.currentUser.name,
                senderAvatar: window.appState.currentUser.avatar,
                audioUrl: e.target.result,
                type: 'audio',
                duration: '0:05',
                time: new Date().toLocaleString(),
                reactions: []
            };
            window.appState.messages[currentChatId].push(newMessage);
            window.saveData();
            renderChatMessages();
        };
        reader.readAsDataURL(audioBlob);
    }
    
    // ===== SHOW TYPING INDICATOR =====
    function showTypingIndicator() {
        const container = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'typing-indicator';
        typingDiv.style.cssText = 'display: flex; align-items: center; gap: 5px; padding: 10px; margin: 5px 0;';
        typingDiv.innerHTML = `
            <img src="${window.appState.users[currentChatUser.id]?.avatar}" style="width: 30px; height: 30px; border-radius: 50%;">
            <div style="background: #1a1a1a; padding: 10px 15px; border-radius: 20px;">
                <div style="display: flex; gap: 3px;">
                    <div style="width: 8px; height: 8px; background: #888; border-radius: 50%; animation: typing 1.4s infinite;"></div>
                    <div style="width: 8px; height: 8px; background: #888; border-radius: 50%; animation: typing 1.4s infinite 0.2s;"></div>
                    <div style="width: 8px; height: 8px; background: #888; border-radius: 50%; animation: typing 1.4s infinite 0.4s;"></div>
                </div>
            </div>
        `;
        container.appendChild(typingDiv);
        container.scrollTop = container.scrollHeight;
        
        setTimeout(() => {
            const indicator = document.getElementById('typingIndicator');
            if (indicator) indicator.remove();
        }, 3000);
    }
    
    // ===== RENDER CHAT MESSAGES =====
    function renderChatMessages() {
        const msgs = window.appState.messages[currentChatId] || [];
        const container = document.getElementById('chatMessages');
        
        container.innerHTML = msgs.map(msg => {
            const isOwn = msg.senderId === window.appState.currentUser.id;
            
            if (msg.type === 'text') {
                return `
                    <div style="display: flex; justify-content: ${isOwn ? 'flex-end' : 'flex-start'}; margin: 10px 0;">
                        ${!isOwn ? `<img src="${msg.senderAvatar}" style="width: 32px; height: 32px; border-radius: 50%; margin-right: 8px;">` : ''}
                        <div style="max-width: 70%;">
                            <div style="background: ${isOwn ? '#ff0000' : '#1a1a1a'}; padding: 10px 15px; border-radius: 18px; ${isOwn ? 'border-bottom-right-radius: 4px;' : 'border-bottom-left-radius: 4px;'}">
                                ${!isOwn ? `<div style="font-size: 11px; font-weight: 600; margin-bottom: 3px;">${window.escapeHtml(msg.senderName)}</div>` : ''}
                                <div style="font-size: 14px; word-wrap: break-word;">${window.escapeHtml(msg.text)}</div>
                            </div>
                            <div style="font-size: 10px; color: #888; margin-top: 3px; text-align: ${isOwn ? 'right' : 'left'}">
                                ${msg.time}
                                <button class="react-btn" data-msg-id="${msg.id}" style="background: none; border: none; color: #888; cursor: pointer; margin-left: 5px;">❤️</button>
                            </div>
                        </div>
                    </div>
                `;
            } else if (msg.type === 'media') {
                return `
                    <div style="display: flex; justify-content: ${isOwn ? 'flex-end' : 'flex-start'}; margin: 10px 0;">
                        ${!isOwn ? `<img src="${msg.senderAvatar}" style="width: 32px; height: 32px; border-radius: 50%; margin-right: 8px;">` : ''}
                        <div>
                            ${msg.mediaType === 'image' ? 
                                `<img src="${msg.mediaUrl}" style="max-width: 200px; max-height: 200px; border-radius: 16px; cursor: pointer;" onclick="window.open('${msg.mediaUrl}')">` :
                                `<video src="${msg.mediaUrl}" controls style="max-width: 200px; max-height: 200px; border-radius: 16px;"></video>`
                            }
                            <div style="font-size: 10px; color: #888; margin-top: 3px; text-align: ${isOwn ? 'right' : 'left'}">${msg.time}</div>
                        </div>
                    </div>
                `;
            } else if (msg.type === 'audio') {
                return `
                    <div style="display: flex; justify-content: ${isOwn ? 'flex-end' : 'flex-start'}; margin: 10px 0;">
                        ${!isOwn ? `<img src="${msg.senderAvatar}" style="width: 32px; height: 32px; border-radius: 50%; margin-right: 8px;">` : ''}
                        <div style="background: ${isOwn ? '#ff0000' : '#1a1a1a'}; padding: 10px 15px; border-radius: 18px;">
                            <audio controls style="width: 200px;">
                                <source src="${msg.audioUrl}" type="audio/webm">
                            </audio>
                            <div style="font-size: 10px; color: #888; margin-top: 3px;">${msg.time}</div>
                        </div>
                    </div>
                `;
            }
            return '';
        }).join('');
        
        container.scrollTop = container.scrollHeight;
    }
    
    window.log("Chat.js loaded");
})();
