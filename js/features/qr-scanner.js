// ============================================
// NOVA - QR-SCANNER.JS (QR kod skanerlash va yaratish)
// Profil, video, guruh uchun QR kod
// ============================================

(function() {
    "use strict";
    
    let scannerActive = false;
    let videoStream = null;
    
    // ===== QR KOD SKANERLASH MODALI =====
    window.showQrScanner = function() {
        let modal = document.getElementById('qrScannerModal');
        if (!modal) {
            modal = createQrScannerModal();
        }
        modal.style.display = 'flex';
        startScanner();
    };
    
    function createQrScannerModal() {
        const modal = document.createElement('div');
        modal.id = 'qrScannerModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3><i class="fas fa-qrcode"></i> QR kod skanerlash</h3>
                    <button class="close-modal" id="closeScannerModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="position: relative; background: #000; border-radius: 16px; overflow: hidden;">
                        <video id="qrVideo" autoplay playsinline style="width: 100%; height: 300px; object-fit: cover;"></video>
                        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; border: 2px solid #ff0000; margin: 20px; pointer-events: none; border-radius: 12px;"></div>
                        <div style="position: absolute; bottom: 10px; left: 0; right: 0; text-align: center; color: #fff; background: rgba(0,0,0,0.7); padding: 5px;">
                            QR kodni ramkaga joylashtiring
                        </div>
                    </div>
                    <button id="stopScannerBtn" class="btn btn-secondary" style="margin-top: 15px; width: 100%;">⏹️ To'xtatish</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('closeScannerModal').onclick = () => {
            modal.style.display = 'none';
            stopScanner();
        };
        document.getElementById('stopScannerBtn').onclick = () => {
            modal.style.display = 'none';
            stopScanner();
        };
        
        return modal;
    }
    
    async function startScanner() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            const video = document.getElementById('qrVideo');
            video.srcObject = stream;
            videoStream = stream;
            
            scannerActive = true;
            scanQRCode();
        } catch (err) {
            window.showToast("❌ Kamera ruxsatini bering!");
        }
    }
    
    function stopScanner() {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }
        scannerActive = false;
    }
    
    function scanQRCode() {
        if (!scannerActive) return;
        
        const video = document.getElementById('qrVideo');
        if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // QR kodni o'qish (simulyatsiya)
            // Real QR skaner uchun qr-scanner library kerak
            // Bu yerda simulyatsiya qilingan
            checkForQRCode(imageData);
        }
        
        requestAnimationFrame(scanQRCode);
    }
    
    function checkForQRCode(imageData) {
        // Simulated QR detection
        // In real app, use: https://github.com/nimiq/qr-scanner
        // For demo, we'll simulate after 3 seconds
        if (!window.qrDetected) {
            window.qrDetected = setTimeout(() => {
                if (scannerActive) {
                    window.showToast("✅ QR kod topildi! (Demo mode)");
                    stopScanner();
                    document.getElementById('qrScannerModal').style.display = 'none';
                    showQrResult('profile', window.appState.currentUser.id);
                }
            }, 3000);
        }
    }
    
    // ===== QR KOD YARATISH =====
    window.generateQRCode = function(type, data) {
        let modal = document.getElementById('qrGeneratorModal');
        if (!modal) {
            modal = createQrGeneratorModal();
        }
        
        let qrData = '';
        let title = '';
        
        switch(type) {
            case 'profile':
                qrData = `nova://profile/${data}`;
                title = 'Profil QR kodi';
                break;
            case 'video':
                qrData = `nova://video/${data}`;
                title = 'Video QR kodi';
                break;
            case 'group':
                qrData = `nova://group/${data}`;
                title = 'Guruh QR kodi';
                break;
            case 'link':
                qrData = data;
                title = 'Link QR kodi';
                break;
        }
        
        document.getElementById('qrTitle').textContent = title;
        
        // Generate QR code using canvas
        const canvas = document.getElementById('qrCanvas');
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Draw fake QR (in real app use qrcode library)
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#000';
        
        // Draw QR pattern (simplified for demo)
        const cellSize = size / 25;
        for (let i = 0; i < 25; i++) {
            for (let j = 0; j < 25; j++) {
                if ((i * j) % 3 === 0 || (i + j) % 5 === 0) {
                    ctx.fillRect(i * cellSize, j * cellSize, cellSize - 1, cellSize - 1);
                }
            }
        }
        
        // Draw position markers
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 7 * cellSize, 7 * cellSize);
        ctx.fillStyle = '#fff';
        ctx.fillRect(1 * cellSize, 1 * cellSize, 5 * cellSize, 5 * cellSize);
        ctx.fillStyle = '#000';
        ctx.fillRect(2 * cellSize, 2 * cellSize, 3 * cellSize, 3 * cellSize);
        
        ctx.fillStyle = '#000';
        ctx.fillRect(size - 7 * cellSize, 0, 7 * cellSize, 7 * cellSize);
        ctx.fillStyle = '#fff';
        ctx.fillRect(size - 6 * cellSize, 1 * cellSize, 5 * cellSize, 5 * cellSize);
        ctx.fillStyle = '#000';
        ctx.fillRect(size - 5 * cellSize, 2 * cellSize, 3 * cellSize, 3 * cellSize);
        
        ctx.fillStyle = '#000';
        ctx.fillRect(0, size - 7 * cellSize, 7 * cellSize, 7 * cellSize);
        ctx.fillStyle = '#fff';
        ctx.fillRect(1 * cellSize, size - 6 * cellSize, 5 * cellSize, 5 * cellSize);
        ctx.fillStyle = '#000';
        ctx.fillRect(2 * cellSize, size - 5 * cellSize, 3 * cellSize, 3 * cellSize);
        
        document.getElementById('qrData').value = qrData;
        
        modal.style.display = 'flex';
    };
    
    function createQrGeneratorModal() {
        const modal = document.createElement('div');
        modal.id = 'qrGeneratorModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 450px;">
                <div class="modal-header">
                    <h3 id="qrTitle"><i class="fas fa-qrcode"></i> QR kod</h3>
                    <button class="close-modal" id="closeQrModal">&times;</button>
                </div>
                <div class="modal-body" style="text-align: center;">
                    <canvas id="qrCanvas" style="width: 200px; height: 200px; margin: 0 auto; display: block; border: 1px solid #ff0000; border-radius: 12px;"></canvas>
                    <div style="margin: 15px 0;">
                        <input type="text" id="qrData" class="form-input" readonly style="text-align: center;">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button id="downloadQrBtn" class="btn btn-primary">💾 Yuklab olish</button>
                        <button id="shareQrBtn" class="btn btn-secondary">📤 Ulashish</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('closeQrModal').onclick = () => modal.style.display = 'none';
        
        document.getElementById('downloadQrBtn').onclick = () => {
            const canvas = document.getElementById('qrCanvas');
            const link = document.createElement('a');
            link.download = 'nova_qr.png';
            link.href = canvas.toDataURL();
            link.click();
            window.showToast("✅ QR kod yuklab olindi!");
        };
        
        document.getElementById('shareQrBtn').onclick = () => {
            const canvas = document.getElementById('qrCanvas');
            canvas.toBlob(blob => {
                const file = new File([blob], 'nova_qr.png', { type: 'image/png' });
                if (navigator.share) {
                    navigator.share({
                        title: 'NOVA QR kod',
                        files: [file]
                    });
                } else {
                    window.showToast("🔗 Havola nusxalandi!");
                }
            });
        };
        
        return modal;
    }
    
    // ===== QR KOD ORQALI NATIJANI KO'RSATISH =====
    function showQrResult(type, id) {
        let modal = document.getElementById('qrResultModal');
        if (!modal) {
            modal = createQrResultModal();
        }
        
        let content = '';
        switch(type) {
            case 'profile':
                const user = window.appState.users[id];
                if (user) {
                    content = `
                        <div style="text-align: center;">
                            <img src="${user.avatar}" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 15px;">
                            <h3>${window.escapeHtml(user.name)}</h3>
                            <p>${window.escapeHtml(user.bio)}</p>
                            <button id="viewProfileBtn" class="btn btn-primary">Profilsga o'tish</button>
                        </div>
                    `;
                }
                break;
            case 'video':
                const video = window.appState.posts.find(p => p.id === id);
                if (video) {
                    content = `
                        <div style="text-align: center;">
                            <video src="${video.mediaUrl}" style="width: 100%; max-height: 200px; border-radius: 12px;"></video>
                            <h3>${window.escapeHtml(video.caption)}</h3>
                            <p>${window.escapeHtml(video.userName)}</p>
                            <button id="viewVideoBtn" class="btn btn-primary">Videoni ko'rish</button>
                        </div>
                    `;
                }
                break;
        }
        
        document.getElementById('qrResultContent').innerHTML = content;
        modal.style.display = 'flex';
        
        if (type === 'profile') {
            document.getElementById('viewProfileBtn').onclick = () => {
                window.goToChannel(id);
                modal.style.display = 'none';
            };
        } else if (type === 'video') {
            document.getElementById('viewVideoBtn').onclick = () => {
                const video = window.appState.posts.find(p => p.id === id);
                if (video) {
                    window.renderCustomFeed([video]);
                    modal.style.display = 'none';
                }
            };
        }
    }
    
    function createQrResultModal() {
        const modal = document.createElement('div');
        modal.id = 'qrResultModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3><i class="fas fa-check-circle" style="color: #00cc00;"></i> QR kod natijasi</h3>
                    <button class="close-modal" id="closeQrResultModal">&times;</button>
                </div>
                <div class="modal-body" id="qrResultContent"></div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('closeQrResultModal').onclick = () => modal.style.display = 'none';
        return modal;
    }
    
    // ===== PROFILGA QR KOD QO'SHISH =====
    function addQrToProfile() {
        const profileSection = document.querySelector('.profile');
        if (profileSection && !document.querySelector('.qr-profile-btn')) {
            const qrBtn = document.createElement('button');
            qrBtn.className = 'qr-profile-btn';
            qrBtn.innerHTML = '<i class="fas fa-qrcode"></i>';
            qrBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                color: #ff0000;
                font-size: 20px;
                cursor: pointer;
            `;
            qrBtn.title = 'QR kodim';
            qrBtn.onclick = () => {
                window.generateQRCode('profile', window.appState.currentUser.id);
            };
            
            const profileDiv = document.querySelector('.profile');
            if (profileDiv) {
                profileDiv.style.position = 'relative';
                profileDiv.appendChild(qrBtn);
            }
        }
    }
    
    // ===== POSTLARGA QR KOD QO'SHISH =====
    function addQrToPosts() {
        const observer = new MutationObserver(() => {
            document.querySelectorAll('.post').forEach(post => {
                if (!post.querySelector('.qr-post-btn')) {
                    const qrBtn = document.createElement('button');
                    qrBtn.className = 'qr-post-btn';
                    qrBtn.innerHTML = '<i class="fas fa-qrcode"></i>';
                    qrBtn.style.cssText = `
                        background: none;
                        border: none;
                        color: #888;
                        font-size: 14px;
                        cursor: pointer;
                        margin-left: 10px;
                    `;
                    qrBtn.title = 'QR kod yaratish';
                    qrBtn.onclick = (e) => {
                        e.stopPropagation();
                        const postId = post.dataset.postId;
                        window.generateQRCode('video', postId);
                    };
                    
                    const postActions = post.querySelector('.post-actions');
                    if (postActions) {
                        postActions.appendChild(qrBtn);
                    }
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    // ===== SIDEBARGA SKANER TUGMASI =====
    function addScannerButton() {
        const navMenu = document.querySelector('.sidebar-nav');
        if (navMenu && !document.querySelector('[data-page="scanner"]')) {
            const scannerNav = document.createElement('div');
            scannerNav.className = 'nav-item';
            scannerNav.setAttribute('data-page', 'scanner');
            scannerNav.innerHTML = '<i class="fas fa-qrcode"></i><span>QR skaner</span>';
            scannerNav.onclick = () => window.showQrScanner();
            
            const settingsNav = document.querySelector('[data-page="settings"]');
            if (settingsNav && settingsNav.parentNode) {
                settingsNav.parentNode.insertBefore(scannerNav, settingsNav);
            } else {
                navMenu.appendChild(scannerNav);
            }
        }
    }
    
    function init() {
        addScannerButton();
        addQrToProfile();
        addQrToPosts();
        window.log("QR-Scanner.js loaded");
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    window.log("QR-Scanner.js loaded");
})();
