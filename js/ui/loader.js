// ============================================
// NOVA - LOADER.JS (Yuklash animatsiyasi)
// ============================================

(function() {
    "use strict";
    
    let loaderCount = 0;
    
    // ===== SHOW LOADER =====
    window.showLoader = function() {
        loaderCount++;
        let loader = document.getElementById('globalLoader');
        
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'globalLoader';
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                gap: 15px;
            `;
            loader.innerHTML = `
                <div class="nova-loader-spinner"></div>
                <div class="nova-loader-text">Yuklanmoqda...</div>
            `;
            document.body.appendChild(loader);
            
            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                .nova-loader-spinner {
                    width: 50px;
                    height: 50px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-top: 3px solid #ff0000;
                    border-radius: 50%;
                    animation: loaderSpin 1s linear infinite;
                }
                .nova-loader-text {
                    color: #fff;
                    font-size: 14px;
                    font-weight: 500;
                }
                @keyframes loaderSpin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        loader.style.display = 'flex';
    };
    
    // ===== HIDE LOADER =====
    window.hideLoader = function() {
        loaderCount--;
        if (loaderCount <= 0) {
            loaderCount = 0;
            const loader = document.getElementById('globalLoader');
            if (loader) {
                loader.style.display = 'none';
            }
        }
    };
    
    // ===== WITH LOADER (wrapper function) =====
    window.withLoader = async function(callback, loadingText = 'Yuklanmoqda...') {
        window.showLoader();
        try {
            const result = await callback();
            return result;
        } finally {
            window.hideLoader();
        }
    };
    
    // ===== SKELETON LOADER FOR FEED =====
    window.showFeedSkeleton = function() {
        const container = document.getElementById('feedContainer');
        if (container) {
            container.innerHTML = `
                <div class="skeleton-post">
                    <div class="skeleton-header">
                        <div class="skeleton-avatar"></div>
                        <div class="skeleton-text"></div>
                    </div>
                    <div class="skeleton-media"></div>
                    <div class="skeleton-actions">
                        <div class="skeleton-icon"></div>
                        <div class="skeleton-icon"></div>
                        <div class="skeleton-icon"></div>
                    </div>
                </div>
                <div class="skeleton-post">
                    <div class="skeleton-header">
                        <div class="skeleton-avatar"></div>
                        <div class="skeleton-text"></div>
                    </div>
                    <div class="skeleton-media"></div>
                    <div class="skeleton-actions">
                        <div class="skeleton-icon"></div>
                        <div class="skeleton-icon"></div>
                        <div class="skeleton-icon"></div>
                    </div>
                </div>
            `;
            
            // Add skeleton styles
            const style = document.createElement('style');
            style.textContent = `
                .skeleton-post {
                    background: #0a0a0a;
                    border-radius: 16px;
                    overflow: hidden;
                    margin-bottom: 20px;
                }
                .skeleton-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 15px;
                }
                .skeleton-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
                    background-size: 200% 100%;
                    animation: skeletonShimmer 1.5s infinite;
                }
                .skeleton-text {
                    width: 150px;
                    height: 14px;
                    background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
                    background-size: 200% 100%;
                    border-radius: 7px;
                    animation: skeletonShimmer 1.5s infinite;
                }
                .skeleton-media {
                    width: 100%;
                    height: 300px;
                    background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
                    background-size: 200% 100%;
                    animation: skeletonShimmer 1.5s infinite;
                }
                .skeleton-actions {
                    display: flex;
                    gap: 20px;
                    padding: 12px 15px;
                }
                .skeleton-icon {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
                    background-size: 200% 100%;
                    animation: skeletonShimmer 1.5s infinite;
                }
                @keyframes skeletonShimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `;
            document.head.appendChild(style);
        }
    };
    
    window.log("Loader.js loaded");
})();
