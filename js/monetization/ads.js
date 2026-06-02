// ============================================
// NOVA - ADS.JS (Reklama tizimi)
// ============================================

(function() {
    "use strict";
    
    let adInterval = null;
    let currentVideoAd = null;
    
    const ADS = [
        { id: 1, type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: 15, reward: 10 },
        { id: 2, type: 'banner', text: '🔥 Nova Coin sotib oling! 50% chegirma', link: '#' },
        { id: 3, type: 'banner', text: '📱 NOVA Premium - Reklamasiz video!', link: '#' },
        { id: 4, type: 'banner', text: '🎁 Donorlik qiling va maxsus galichka oling!', link: '#' }
    ];
    
    // ===== SHOW VIDEO AD =====
    window.showVideoAd = function(callback) {
        if (window.appState.currentUser.isPremium) {
            if (callback) callback();
            return;
        }
        
        const ad = ADS.find(a => a.type === 'video');
        if (!ad) {
            if (callback) callback();
            return;
        }
        
        let modal = document.getElementById('videoAdModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'videoAdModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 400px; text-align: center;">
                    <div class="modal-header">
                        <h3><i class="fas fa-ad"></i> Video reklama</h3>
                    </div>
                    <div class="modal-body">
                        <video id="adVideo" autoplay style="width: 100%; border-radius: 12px;"></video>
                        <div id="adTimer" style="font-size: 24px; font-weight: bold; margin: 15px 0;">15</div>
                        <button id="skipAdBtn" class="btn btn-secondary" disabled>⏭️ O'tkazib yubor (15s)</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        const video = document.getElementById('adVideo');
        video.src = ad.url;
        video.play();
        
        let timeLeft = ad.duration;
        const timerSpan = document.getElementById('adTimer');
        const skipBtn = document.getElementById('skipAdBtn');
        
        const interval = setInterval(() => {
            timeLeft--;
            timerSpan.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(interval);
                skipBtn.disabled = false;
                skipBtn.textContent = '✅ Davom etish';
                skipBtn.style.background = '#ff0000';
            }
        }, 1000);
        
        skipBtn.onclick = () => {
            clearInterval(interval);
            modal.style.display = 'none';
            video.pause();
            if (callback) callback();
            window.addCoins(ad.reward, "Video reklama ko'rildi");
            window.showToast(`+${ad.reward} Nova Coin`);
        };
        
        modal.style.display = 'flex';
    };
    
    // ===== SHOW BANNER AD =====
    window.showBannerAd = function() {
        if (window.appState.currentUser.isPremium) return;
        
        let banner = document.querySelector('.banner-ad');
        if (!banner) {
            banner = document.createElement('div');
            banner.className = 'banner-ad';
            banner.style.cssText = `
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #1a1a1a, #0a0a0a);
                border-top: 2px solid #ff0000;
                padding: 12px;
                text-align: center;
                z-index: 9999;
                cursor: pointer;
                animation: slideInUp 0.3s ease;
            `;
            document.body.appendChild(banner);
        }
        
        const ad = ADS.find(a => a.type === 'banner');
        if (ad) {
            banner.innerHTML = `
                <span style="color: #ffd700;">📢 REKLAMA:</span> ${ad.text}
                <span style="color: #ff0000; margin-left: 10px;">👉 Bosish</span>
                <button style="background: none; border: none; color: #888; position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer;" id="closeBannerAd">✖</button>
            `;
            banner.onclick = () => {
                window.open(ad.link, '_blank');
                window.addCoins(1, "Reklama bosildi");
            };
            document.getElementById('closeBannerAd').onclick = (e) => {
                e.stopPropagation();
                banner.style.display = 'none';
            };
        }
        
        // Auto hide after 15 seconds
        setTimeout(() => {
            if (banner) banner.style.display = 'none';
        }, 15000);
    };
    
    // ===== START BANNER ADS =====
    window.startBannerAds = function() {
        if (adInterval) clearInterval(adInterval);
        adInterval = setInterval(() => {
            if (!window.appState.currentUser.isPremium) {
                window.showBannerAd();
            }
        }, 60000); // Every minute
    };
    
    window.log("Ads.js loaded");
})();
