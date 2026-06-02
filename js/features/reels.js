// ============================================
// NOVA - REELS.JS (Reels tizimi)
// ============================================

(function() {
    "use strict";
    
    let reelsVideo = null;
    
    // ===== SHOW REELS =====
    window.showReels = function() {
        const reelsList = window.appState.posts.filter(p => p.mediaType === 'video');
        
        if (reelsList.length === 0) {
            window.showToast("📱 Hozircha reelslar yo'q");
            return;
        }
        
        const container = document.getElementById('reelsContainer');
        const listDiv = document.getElementById('reelsList');
        
        listDiv.innerHTML = reelsList.map((reel, idx) => `
            <div class="reel" data-idx="${idx}">
                <video class="reel-video" src="${reel.mediaUrl}" preload="metadata" playsinline></video>
                <div class="reel-overlay">
                    <div class="reel-user">
                        <img src="${reel.userAvatar}" class="reel-avatar" onclick="window.goToChannel('${reel.userId}')">
                        <div class="reel-name" onclick="window.goToChannel('${reel.userId}')">${window.escapeHtml(reel.userName)}</div>
                        <button class="follow-btn" onclick="event.stopPropagation(); window.toggleSubscribe('${reel.userId}')" style="padding: 3px 10px">
                            ${window.appState.subscriptions.includes(reel.userId) ? 'Obunada' : 'Obuna'}
                        </button>
                    </div>
                    <div class="reel-caption">${window.escapeHtml(reel.caption || '')}</div>
                    ${reel.description ? `<div class="reel-music"><i class="fas fa-music"></i> ${window.escapeHtml(reel.description)}</div>` : ''}
                </div>
                <div class="reel-actions">
                    <button class="reel-action" onclick="window.toggleLike('${reel.id}')">
                        <i class="fas fa-heart"></i>
                        <span>${reel.likes || 0}</span>
                    </button>
                    <button class="reel-action" onclick="window.showComments('${reel.id}')">
                        <i class="fas fa-comment"></i>
                        <span>${reel.comments?.length || 0}</span>
                    </button>
                    <button class="reel-action" onclick="window.sharePost('${reel.id}')">
                        <i class="fas fa-share"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        container.style.display = 'block';
        
        // Auto-play videos on scroll
        const videos = document.querySelectorAll('.reel-video');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    if (reelsVideo && reelsVideo !== video) reelsVideo.pause();
                    video.play();
                    reelsVideo = video;
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.5 });
        
        videos.forEach(video => observer.observe(video));
        
        // Click to pause/play
        videos.forEach(video => {
            video.onclick = () => {
                if (video.paused) video.play();
                else video.pause();
            };
        });
    };
    
    // ===== CLOSE REELS =====
    function setupReelsClose() {
        const closeBtn = document.getElementById('closeReelsBtn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                document.getElementById('reelsContainer').style.display = 'none';
                if (reelsVideo) reelsVideo.pause();
            };
        }
    }
    
    function init() {
        setupReelsClose();
        window.log("Reels.js loaded");
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
