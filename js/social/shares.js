// ============================================
// NOVA - SHARES.JS (Ulashish tizimi)
// ============================================

(function() {
    "use strict";
    
    // ===== SHARE POST =====
    window.sharePost = function(postId) {
        const post = window.appState.posts.find(p => p.id === postId);
        if (!post) return;
        
        const shareUrl = `${window.location.origin}?post=${postId}`;
        const shareText = `${post.caption || 'Video'} - ${post.userName} | NOVA`;
        
        // Check if Web Share API is available
        if (navigator.share) {
            navigator.share({
                title: 'NOVA - Video',
                text: shareText,
                url: shareUrl
            }).then(() => {
                window.showToast("✅ Ulashildi!");
                post.shares = (post.shares || 0) + 1;
                window.saveData();
                window.renderFeed();
            }).catch(() => {
                showShareModal(post, shareUrl, shareText);
            });
        } else {
            showShareModal(post, shareUrl, shareText);
        }
    };
    
    // ===== SHARE MODAL =====
    function showShareModal(post, shareUrl, shareText) {
        let modal = document.getElementById('shareModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'shareModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-share-alt"></i> Ulashish</h3>
                        <button class="close-modal" id="closeShareModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: center;">
                            <div class="share-option" data-platform="telegram">
                                <div style="width: 50px; height: 50px; background: #0088cc; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                                    <i class="fab fa-telegram-plane" style="font-size: 24px; color: #fff;"></i>
                                </div>
                                <div style="margin-top: 5px; font-size: 12px;">Telegram</div>
                            </div>
                            <div class="share-option" data-platform="instagram">
                                <div style="width: 50px; height: 50px; background: linear-gradient(45deg, #f09433, #d62976, #962fbf); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                                    <i class="fab fa-instagram" style="font-size: 24px; color: #fff;"></i>
                                </div>
                                <div style="margin-top: 5px; font-size: 12px;">Instagram</div>
                            </div>
                            <div class="share-option" data-platform="facebook">
                                <div style="width: 50px; height: 50px; background: #1877f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                                    <i class="fab fa-facebook-f" style="font-size: 24px; color: #fff;"></i>
                                </div>
                                <div style="margin-top: 5px; font-size: 12px;">Facebook</div>
                            </div>
                            <div class="share-option" data-platform="twitter">
                                <div style="width: 50px; height: 50px; background: #1da1f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                                    <i class="fab fa-twitter" style="font-size: 24px; color: #fff;"></i>
                                </div>
                                <div style="margin-top: 5px; font-size: 12px;">Twitter</div>
                            </div>
                            <div class="share-option" data-platform="whatsapp">
                                <div style="width: 50px; height: 50px; background: #25d366; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                                    <i class="fab fa-whatsapp" style="font-size: 24px; color: #fff;"></i>
                                </div>
                                <div style="margin-top: 5px; font-size: 12px;">WhatsApp</div>
                            </div>
                            <div class="share-option" data-platform="copy">
                                <div style="width: 50px; height: 50px; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                                    <i class="fas fa-link" style="font-size: 24px; color: #fff;"></i>
                                </div>
                                <div style="margin-top: 5px; font-size: 12px;">Havola</div>
                            </div>
                        </div>
                        <div style="margin-top: 20px;">
                            <div style="background: #1a1a1a; border-radius: 8px; padding: 10px;">
                                <div style="font-size: 12px; color: #888; margin-bottom: 5px;">Havola:</div>
                                <div style="display: flex; gap: 10px;">
                                    <input type="text" id="shareLinkInput" value="${shareUrl}" readonly style="flex: 1; background: #0a0a0a; border: 1px solid #ff0000; border-radius: 8px; padding: 8px; color: #fff; font-size: 12px;">
                                    <button id="copyLinkBtn" style="background: #ff0000; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer;">Nusxalash</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            document.getElementById('closeShareModal').onclick = () => {
                modal.style.display = 'none';
            };
            
            document.querySelectorAll('.share-option').forEach(option => {
                option.onclick = () => {
                    const platform = option.dataset.platform;
                    shareToPlatform(platform, shareUrl, shareText);
                    modal.style.display = 'none';
                };
            });
            
            document.getElementById('copyLinkBtn').onclick = () => {
                const input = document.getElementById('shareLinkInput');
                input.select();
                document.execCommand('copy');
                window.showToast("🔗 Havola nusxalandi!");
                modal.style.display = 'none';
                
                // Update share count
                post.shares = (post.shares || 0) + 1;
                window.saveData();
                window.renderFeed();
            };
        }
        
        modal.style.display = 'flex';
    }
    
    // ===== SHARE TO PLATFORM =====
    function shareToPlatform(platform, url, text) {
        let shareUrl = '';
        
        switch(platform) {
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
                break;
            case 'instagram':
                // Instagram doesn't have a direct share URL, copy to clipboard
                navigator.clipboard.writeText(`${text}\n${url}`);
                window.showToast("📋 Havola nusxalandi! Instagram'ga joylashtiring");
                return;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(`${text}\n${url}`);
                window.showToast("🔗 Havola nusxalandi!");
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
        
        // Update share count
        const post = window.appState.posts.find(p => p.mediaUrl && p.caption);
        if (post) {
            post.shares = (post.shares || 0) + 1;
            window.saveData();
            window.renderFeed();
        }
    }
    
    // ===== REPORT POST =====
    window.reportPost = function(postId) {
        const reasons = ['Spam', 'Nopok kontent', 'Huquqbuzarlik', 'Nafrat uyg'otadi', 'Boshqa'];
        
        let modal = document.getElementById('reportModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'reportModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-flag"></i> Shikoyat qilish</h3>
                        <button class="close-modal" id="closeReportModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p style="margin-bottom: 15px;">Iltimos, shikoyat sababini tanlang:</p>
                        <div id="reportReasons"></div>
                        <button id="submitReportBtn" class="btn btn-primary" style="margin-top: 20px;">Yuborish</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('closeReportModal').onclick = () => modal.style.display = 'none';
        }
        
        const reasonsDiv = document.getElementById('reportReasons');
        reasonsDiv.innerHTML = reasons.map(reason => `
            <label style="display: flex; align-items: center; gap: 10px; padding: 10px; margin: 5px 0; background: #1a1a1a; border-radius: 8px; cursor: pointer;">
                <input type="radio" name="reportReason" value="${reason}">
                <span>${reason}</span>
            </label>
        `).join('');
        
        document.getElementById('submitReportBtn').onclick = () => {
            const selected = document.querySelector('input[name="reportReason"]:checked');
            if (selected) {
                window.showToast("📢 Shikoyatingiz qabul qilindi!");
                modal.style.display = 'none';
                
                // Add to admin reports
                const reports = JSON.parse(localStorage.getItem('nova_reports') || '[]');
                reports.push({
                    id: Date.now(),
                    postId: postId,
                    reason: selected.value,
                    reporterId: window.appState.currentUser.id,
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem('nova_reports', JSON.stringify(reports));
            } else {
                window.showToast("❌ Iltimos, sababni tanlang!");
            }
        };
        
        modal.style.display = 'flex';
    };
    
    window.log("Shares.js loaded");
})();
