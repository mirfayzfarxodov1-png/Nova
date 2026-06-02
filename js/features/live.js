// ============================================
// NOVA - LIVE.JS (Jonli efir)
// ============================================

(function() {
    "use strict";
    
    let liveStream = null;
    let mediaRecorder = null;
    let liveChunks = [];
    let isLive = false;
    
    window.startLiveStream = async function() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            liveStream = stream;
            
            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;
            video.playsInline = true;
            
            // Create live modal
            let modal = document.getElementById('liveModal');
            if (!modal) {
                modal = createLiveModal();
            }
            
            document.getElementById('liveVideo').srcObject = stream;
            modal.style.display = 'flex';
            
            // Start recording
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    liveChunks.push(event.data);
                }
            };
            mediaRecorder.start(1000);
            isLive = true;
            
            // Update live badge
            document.getElementById('liveStatus').innerHTML = '<span style="color: #ff0000;">🔴 JONLI EFIR</span>';
            
            window.showToast("🔴 Jonli efir boshlandi!");
            
        } catch (err) {
            window.showToast("❌ Kamera ruxsatini bering!");
        }
    };
    
    window.stopLiveStream = function() {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            mediaRecorder.onstop = () => {
                const blob = new Blob(liveChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                
                // Save as post
                const newPost = {
                    id: 'live_' + Date.now(),
                    userId: window.appState.currentUser.id,
                    userName: window.appState.currentUser.name,
                    userAvatar: window.appState.currentUser.avatar,
                    caption: '🔴 Jonli efir',
                    mediaUrl: url,
                    mediaType: 'video',
                    likes: 0,
                    comments: [],
                    shares: 0,
                    time: 'hoziroq',
                    liked: false,
                    privacy: 'public',
                    isLiveReplay: true
                };
                window.appState.posts.unshift(newPost);
                window.saveData();
                window.renderFeed();
                window.showToast("📹 Jonli efir saqlandi!");
            };
        }
        
        if (liveStream) {
            liveStream.getTracks().forEach(track => track.stop());
            liveStream = null;
        }
        
        isLive = false;
        document.getElementById('liveModal').style.display = 'none';
        window.showToast("🔴 Jonli efir tugadi!");
    };
    
    function createLiveModal() {
        const modal = document.createElement('div');
        modal.id = 'liveModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3><i class="fas fa-video"></i> Jonli efir</h3>
                    <button class="close-modal" id="closeLiveModal">&times;</button>
                </div>
                <div class="modal-body">
                    <video id="liveVideo" autoplay playsinline style="width: 100%; border-radius: 12px;"></video>
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <button id="stopLiveBtn" class="btn btn-primary" style="background: #ff0000;">⏹️ Tugatish</button>
                        <div id="liveStatus" style="flex: 1; text-align: center; padding: 10px;">⚪ TAYYOR</div>
                    </div>
                    <div id="liveChat" style="margin-top: 15px; height: 200px; overflow-y: auto; background: #1a1a1a; border-radius: 12px; padding: 10px;">
                        <div style="text-align: center; color: #888;">Chat xabarlari...</div>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <input type="text" id="liveChatInput" placeholder="Xabar yozing..." class="form-input" style="flex: 1;">
                        <button id="liveSendBtn" class="btn">Yuborish</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('closeLiveModal').onclick = () => window.stopLiveStream();
        document.getElementById('stopLiveBtn').onclick = () => window.stopLiveStream();
        document.getElementById('liveSendBtn').onclick = () => {
            const input = document.getElementById('liveChatInput');
            if (input.value.trim()) {
                const chatDiv = document.getElementById('liveChat');
                const msg = document.createElement('div');
                msg.innerHTML = `<strong>${window.escapeHtml(window.appState.currentUser.name)}:</strong> ${window.escapeHtml(input.value)}`;
                chatDiv.appendChild(msg);
                chatDiv.scrollTop = chatDiv.scrollHeight;
                input.value = '';
            }
        };
        
        return modal;
    }
    
    window.log("Live.js loaded");
})();
