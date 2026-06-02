// ============================================
// NOVA - VOICE-CHAT.JS (Ovozli chat - WebRTC)
// Birga bir va guruhli ovozli suhbatlar
// ============================================

(function() {
    "use strict";
    
    let localStream = null;
    let peerConnection = null;
    let isInCall = false;
    let currentCallUser = null;
    let audioContext = null;
    let mediaRecorder = null;
    let recordedChunks = [];
    let isRecording = false;
    
    // WebRTC konfiguratsiyasi
    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };
    
    // ===== OVOZLI QO'NG'IROQNI BOSHLASH =====
    window.startVoiceCall = function(userId, userName) {
        if (isInCall) {
            window.showToast("❌ Siz allaqachon qo'ng'iroqdasiz!");
            return;
        }
        
        currentCallUser = { id: userId, name: userName };
        createCallModal();
        initLocalStream();
    };
    
    function createCallModal() {
        let modal = document.getElementById('voiceCallModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'voiceCallModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 400px; text-align: center;">
                    <div class="modal-header">
                        <h3><i class="fas fa-phone-alt"></i> Ovozli qo'ng'iroq</h3>
                        <button class="close-modal" id="closeCallModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="call-avatar" style="margin-bottom: 20px;">
                            <div style="width: 80px; height: 80px; background: #ff0000; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                                <i class="fas fa-microphone" style="font-size: 40px; color: #fff;"></i>
                            </div>
                        </div>
                        <div id="callUserName" style="font-size: 18px; font-weight: 600; margin-bottom: 5px;"></div>
                        <div id="callStatus" style="font-size: 12px; color: #888; margin-bottom: 20px;">Qo'ng'iroq qilinmoqda...</div>
                        <div class="call-timer" style="font-size: 24px; font-weight: bold; margin-bottom: 20px;" id="callTimer">00:00</div>
                        <div class="call-controls" style="display: flex; gap: 20px; justify-content: center;">
                            <button id="muteCallBtn" class="call-control-btn" style="width: 50px; height: 50px; background: #333; border: none; border-radius: 50%; cursor: pointer;">
                                <i class="fas fa-microphone" style="font-size: 20px;"></i>
                            </button>
                            <button id="speakerCallBtn" class="call-control-btn" style="width: 50px; height: 50px; background: #333; border: none; border-radius: 50%; cursor: pointer;">
                                <i class="fas fa-volume-up" style="font-size: 20px;"></i>
                            </button>
                            <button id="recordCallBtn" class="call-control-btn" style="width: 50px; height: 50px; background: #333; border: none; border-radius: 50%; cursor: pointer;">
                                <i class="fas fa-circle" style="font-size: 20px; color: #ff0000;"></i>
                            </button>
                            <button id="endCallBtn" class="call-control-btn" style="width: 50px; height: 50px; background: #ff0000; border: none; border-radius: 50%; cursor: pointer;">
                                <i class="fas fa-phone-slash" style="font-size: 20px;"></i>
                            </button>
                        </div>
                        <div id="voiceLevel" style="margin-top: 20px; height: 4px; background: #333; border-radius: 2px; overflow: hidden;">
                            <div id="voiceLevelBar" style="width: 0%; height: 100%; background: #ff0000; transition: width 0.1s;"></div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            document.getElementById('closeCallModal').onclick = () => endVoiceCall();
            document.getElementById('endCallBtn').onclick = () => endVoiceCall();
            document.getElementById('muteCallBtn').onclick = () => toggleMute();
            document.getElementById('speakerCallBtn').onclick = () => toggleSpeaker();
            document.getElementById('recordCallBtn').onclick = () => toggleCallRecording();
        }
        
        document.getElementById('callUserName').textContent = currentCallUser.name;
        modal.style.display = 'flex';
    }
    
    async function initLocalStream() {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            isInCall = true;
            startCallTimer();
            setupAudioLevel();
            createPeerConnection();
            startCallSimulation();
        } catch (err) {
            window.showToast("❌ Mikrofon ruxsatini bering!");
            endVoiceCall();
        }
    }
    
    function createPeerConnection() {
        peerConnection = new RTCPeerConnection(configuration);
        
        // Add local stream
        if (localStream) {
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });
        }
        
        // Handle remote stream
        peerConnection.ontrack = (event) => {
            const remoteAudio = new Audio();
            remoteAudio.srcObject = event.streams[0];
            remoteAudio.play();
        };
        
        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                // Send candidate to other peer
                console.log('ICE candidate:', event.candidate);
            }
        };
    }
    
    function startCallSimulation() {
        // Simulate call connection
        setTimeout(() => {
            if (isInCall) {
                document.getElementById('callStatus').innerHTML = '📞 Qo\'ng\'iroq davom etmoqda';
                document.getElementById('callStatus').style.color = '#00cc00';
            }
        }, 2000);
    }
    
    // ===== CALL TIMER =====
    let callTimerInterval = null;
    let callSeconds = 0;
    
    function startCallTimer() {
        callSeconds = 0;
        if (callTimerInterval) clearInterval(callTimerInterval);
        callTimerInterval = setInterval(() => {
            if (!isInCall) {
                clearInterval(callTimerInterval);
                return;
            }
            callSeconds++;
            const mins = Math.floor(callSeconds / 60);
            const secs = callSeconds % 60;
            document.getElementById('callTimer').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    // ===== AUDIO LEVEL METER =====
    let audioContextInitialized = false;
    
    function setupAudioLevel() {
        if (!localStream) return;
        
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(localStream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        function updateLevel() {
            if (!isInCall) return;
            analyser.getByteFrequencyData(dataArray);
            let average = 0;
            for (let i = 0; i < dataArray.length; i++) {
                average += dataArray[i];
            }
            average = average / dataArray.length;
            const level = (average / 255) * 100;
            const levelBar = document.getElementById('voiceLevelBar');
            if (levelBar) {
                levelBar.style.width = `${level}%`;
            }
            requestAnimationFrame(updateLevel);
        }
        
        updateLevel();
        audioContextInitialized = true;
    }
    
    // ===== MUTE TOGGLE =====
    let isMuted = false;
    
    function toggleMute() {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                isMuted = !isMuted;
                audioTrack.enabled = !isMuted;
                const muteBtn = document.getElementById('muteCallBtn');
                if (muteBtn) {
                    muteBtn.innerHTML = isMuted ? '<i class="fas fa-microphone-slash" style="font-size: 20px;"></i>' : '<i class="fas fa-microphone" style="font-size: 20px;"></i>';
                    muteBtn.style.background = isMuted ? '#ff0000' : '#333';
                }
                window.showToast(isMuted ? "🔇 Mikrofon o'chirildi" : "🎤 Mikrofon yoqildi");
            }
        }
    }
    
    // ===== SPEAKER TOGGLE =====
    let isSpeakerOn = true;
    
    function toggleSpeaker() {
        isSpeakerOn = !isSpeakerOn;
        const speakerBtn = document.getElementById('speakerCallBtn');
        if (speakerBtn) {
            speakerBtn.innerHTML = isSpeakerOn ? '<i class="fas fa-volume-up" style="font-size: 20px;"></i>' : '<i class="fas fa-volume-mute" style="font-size: 20px;"></i>';
            speakerBtn.style.background = isSpeakerOn ? '#333' : '#ff0000';
        }
        window.showToast(isSpeakerOn ? "🔊 Karnay yoqildi" : "🔇 Karnay o'chirildi");
    }
    
    // ===== CALL RECORDING =====
    async function toggleCallRecording() {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                recordedChunks = [];
                
                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        recordedChunks.push(event.data);
                    }
                };
                
                mediaRecorder.onstop = () => {
                    const blob = new Blob(recordedChunks, { type: 'audio/webm' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `nova_call_${new Date().toISOString().slice(0, 19)}.webm`;
                    a.click();
                    window.showToast("✅ Qo'ng'iroq yozib olindi!");
                    stream.getTracks().forEach(track => track.stop());
                };
                
                mediaRecorder.start();
                isRecording = true;
                const recordBtn = document.getElementById('recordCallBtn');
                if (recordBtn) {
                    recordBtn.style.background = '#ff0000';
                    recordBtn.innerHTML = '<i class="fas fa-stop" style="font-size: 20px;"></i>';
                }
                window.showToast("🔴 Yozib olish boshlandi");
            } catch (err) {
                window.showToast("❌ Yozib olishni boshlab bo'lmadi");
            }
        } else {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                isRecording = false;
                const recordBtn = document.getElementById('recordCallBtn');
                if (recordBtn) {
                    recordBtn.style.background = '#333';
                    recordBtn.innerHTML = '<i class="fas fa-circle" style="font-size: 20px; color: #ff0000;"></i>';
                }
                window.showToast("⏹️ Yozib olish tugadi");
            }
        }
    }
    
    // ===== END VOICE CALL =====
    function endVoiceCall() {
        isInCall = false;
        
        if (callTimerInterval) {
            clearInterval(callTimerInterval);
        }
        
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
        }
        
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
        
        if (audioContext && audioContextInitialized) {
            audioContext.close();
            audioContextInitialized = false;
        }
        
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
        
        const modal = document.getElementById('voiceCallModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        window.showToast("📞 Qo'ng'iroq tugadi");
        currentCallUser = null;
        isRecording = false;
    }
    
    // ===== GROUP VOICE CHAT =====
    let groupCallActive = false;
    let groupMembers = [];
    
    window.startGroupVoiceChat = function() {
        let modal = document.getElementById('groupVoiceModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'groupVoiceModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-users"></i> Guruhli ovozli chat</h3>
                        <button class="close-modal" id="closeGroupVoiceModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="group-voice-status" style="text-align: center; margin-bottom: 20px;">
                            <div style="width: 80px; height: 80px; background: #ff0000; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                                <i class="fas fa-microphone" style="font-size: 40px; color: #fff;"></i>
                            </div>
                            <div id="groupVoiceStatus" style="margin-top: 10px;">🔴 Qo'shilmoqda...</div>
                        </div>
                        <div id="groupMembersList" style="max-height: 300px; overflow-y: auto; margin-bottom: 15px;"></div>
                        <div class="group-call-controls" style="display: flex; gap: 15px; justify-content: center;">
                            <button id="groupMuteBtn" class="call-control-btn" style="width: 50px; height: 50px; background: #333; border: none; border-radius: 50%; cursor: pointer;">
                                <i class="fas fa-microphone" style="font-size: 20px;"></i>
                            </button>
                            <button id="groupLeaveBtn" class="call-control-btn" style="width: 50px; height: 50px; background: #ff0000; border: none; border-radius: 50%; cursor: pointer;">
                                <i class="fas fa-sign-out-alt" style="font-size: 20px;"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            document.getElementById('closeGroupVoiceModal').onclick = () => endGroupVoiceChat();
            document.getElementById('groupLeaveBtn').onclick = () => endGroupVoiceChat();
            document.getElementById('groupMuteBtn').onclick = () => toggleGroupMute();
        }
        
        modal.style.display = 'flex';
        startGroupVoiceChatSimulation();
    };
    
    function startGroupVoiceChatSimulation() {
        groupCallActive = true;
        document.getElementById('groupVoiceStatus').innerHTML = '🟢 Guruh chatida';
        document.getElementById('groupVoiceStatus').style.color = '#00cc00';
        
        // Simulate members
        const members = [
            { name: window.appState.currentUser.name, isActive: true },
            { name: 'Ali', isActive: true },
            { name: 'Vali', isActive: true },
            { name: 'Nodir', isActive: false }
        ];
        
        const membersList = document.getElementById('groupMembersList');
        membersList.innerHTML = members.map(m => `
            <div class="group-member" style="display: flex; align-items: center; gap: 10px; padding: 10px; border-bottom: 1px solid #1a1a1a;">
                <div style="width: 8px; height: 8px; background: ${m.isActive ? '#00cc00' : '#888'}; border-radius: 50%;"></div>
                <div style="flex: 1;">${window.escapeHtml(m.name)}</div>
                ${m.isActive ? '<div class="voice-wave" style="display: flex; gap: 2px;"><span style="width: 3px; height: 10px; background: #ff0000; animation: wave 0.5s infinite;"></span><span style="width: 3px; height: 15px; background: #ff0000; animation: wave 0.5s infinite 0.1s;"></span><span style="width: 3px; height: 8px; background: #ff0000; animation: wave 0.5s infinite 0.2s;"></span></div>' : '<span style="color: #888;">🔇 Mikrofon o\'chirilgan</span>'}
            </div>
        `).join('');
        
        // Add wave animation style
        if (!document.getElementById('waveStyle')) {
            const style = document.createElement('style');
            style.id = 'waveStyle';
            style.textContent = `
                @keyframes wave {
                    0%, 100% { height: 10px; }
                    50% { height: 20px; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    let isGroupMuted = false;
    
    function toggleGroupMute() {
        isGroupMuted = !isGroupMuted;
        const muteBtn = document.getElementById('groupMuteBtn');
        if (muteBtn) {
            muteBtn.innerHTML = isGroupMuted ? '<i class="fas fa-microphone-slash" style="font-size: 20px;"></i>' : '<i class="fas fa-microphone" style="font-size: 20px;"></i>';
            muteBtn.style.background = isGroupMuted ? '#ff0000' : '#333';
        }
        window.showToast(isGroupMuted ? "🔇 Mikrofon o'chirildi" : "🎤 Mikrofon yoqildi");
    }
    
    function endGroupVoiceChat() {
        groupCallActive = false;
        const modal = document.getElementById('groupVoiceModal');
        if (modal) modal.style.display = 'none';
        window.showToast("👋 Guruh chatidan chiqildi");
    }
    
    // ===== CONTEXT MENU QO'NG'IROQ =====
    function addCallToContextMenu() {
        // Add call button to user suggestions
        const observer = new MutationObserver(() => {
            document.querySelectorAll('.suggestion-item').forEach(item => {
                if (!item.querySelector('.call-user-btn')) {
                    const callBtn = document.createElement('button');
                    callBtn.className = 'call-user-btn';
                    callBtn.innerHTML = '<i class="fas fa-phone-alt"></i>';
                    callBtn.style.cssText = `
                        background: none;
                        border: none;
                        color: #ff0000;
                        cursor: pointer;
                        margin-left: 5px;
                        font-size: 14px;
                    `;
                    callBtn.title = 'Ovozli qo\'ng\'iroq';
                    
                    const userId = item.querySelector('[data-user-id]')?.dataset.userId || 
                                   item.querySelector('.suggestion-user')?.onclick?.toString().match(/'([^']+)'/)?.[1];
                    
                    if (userId && userId !== window.appState.currentUser.id) {
                        callBtn.onclick = (e) => {
                            e.stopPropagation();
                            const userName = item.querySelector('.suggestion-user div div:first-child')?.textContent || 'Foydalanuvchi';
                            window.startVoiceCall(userId, userName);
                        };
                        const followBtn = item.querySelector('.follow-btn');
                        if (followBtn) {
                            followBtn.parentNode.insertBefore(callBtn, followBtn.nextSibling);
                        }
                    }
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    // ===== SIDEBARGA GROUP VOICE BUTTON =====
    function addGroupVoiceButton() {
        const navMenu = document.querySelector('.sidebar-nav');
        if (navMenu && !document.querySelector('[data-page="group-voice"]')) {
            const groupVoiceNav = document.createElement('div');
            groupVoiceNav.className = 'nav-item';
            groupVoiceNav.setAttribute('data-page', 'group-voice');
            groupVoiceNav.innerHTML = '<i class="fas fa-headset"></i><span>Ovozli chat</span>';
            groupVoiceNav.onclick = () => window.startGroupVoiceChat();
            
            const chatNav = document.querySelector('[data-page="chat"]');
            if (chatNav && chatNav.parentNode) {
                chatNav.parentNode.insertBefore(groupVoiceNav, chatNav.nextSibling);
            } else {
                navMenu.appendChild(groupVoiceNav);
            }
        }
    }
    
    function init() {
        addCallToContextMenu();
        addGroupVoiceButton();
        window.log("Voice-Chat.js loaded");
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    window.log("Voice-Chat.js loaded");
})();
