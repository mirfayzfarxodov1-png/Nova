// ============================================
// NOVA - SETTINGS.JS (Sozlamalar + Galereyadan fon)
// ============================================

(function() {
    "use strict";
    
    // ===== SHOW SETTINGS =====
    window.showSettings = function() {
        const modal = document.getElementById('settingsModal');
        
        // Load current settings into form
        document.getElementById('darkMode').checked = window.appState.settings.darkMode;
        document.getElementById('themeColor').value = window.appState.settings.themeColor;
        document.getElementById('fontSize').value = window.appState.settings.fontSize;
        document.getElementById('autoPlay').checked = window.appState.settings.autoPlay;
        document.getElementById('hdVideo').checked = window.appState.settings.hdVideo;
        document.getElementById('notifSub').checked = window.appState.settings.notifSub;
        document.getElementById('notifLike').checked = window.appState.settings.notifLike;
        document.getElementById('notifComment').checked = window.appState.settings.notifComment;
        
        modal.style.display = 'flex';
    };
    
    // ===== SAVE SETTINGS =====
    window.saveSettings = function() {
        window.appState.settings.darkMode = document.getElementById('darkMode').checked;
        window.appState.settings.themeColor = document.getElementById('themeColor').value;
        window.appState.settings.fontSize = document.getElementById('fontSize').value;
        window.appState.settings.autoPlay = document.getElementById('autoPlay').checked;
        window.appState.settings.hdVideo = document.getElementById('hdVideo').checked;
        window.appState.settings.notifSub = document.getElementById('notifSub').checked;
        window.appState.settings.notifLike = document.getElementById('notifLike').checked;
        window.appState.settings.notifComment = document.getElementById('notifComment').checked;
        
        window.saveData();
        window.applySettings();
        window.showToast("✅ Sozlamalar saqlandi!");
        document.getElementById('settingsModal').style.display = 'none';
    };
    
    // ===== RESET SETTINGS =====
    window.resetSettings = function() {
        if (confirm("Barcha sozlamalarni tiklash?")) {
            localStorage.clear();
            location.reload();
        }
    };
    
    // ===== SET WALLPAPER FROM GALLERY =====
    window.setWallpaperFromGallery = function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const wallpaperUrl = ev.target.result;
                    document.body.style.backgroundImage = `url(${wallpaperUrl})`;
                    document.body.style.backgroundSize = 'cover';
                    document.body.style.backgroundPosition = 'center';
                    document.body.style.backgroundAttachment = 'fixed';
                    localStorage.setItem('nova_wallpaper', wallpaperUrl);
                    window.showToast("✅ Fon rasmi o'zgartirildi!");
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };
    
    // ===== REMOVE WALLPAPER =====
    window.removeWallpaper = function() {
        document.body.style.backgroundImage = '';
        document.body.style.background = window.appState.settings.darkMode ? '#000' : '#fff';
        localStorage.removeItem('nova_wallpaper');
        window.showToast("❌ Fon rasmi olib tashlandi");
    };
    
    // ===== LOAD SAVED WALLPAPER =====
    function loadSavedWallpaper() {
        const savedWallpaper = localStorage.getItem('nova_wallpaper');
        if (savedWallpaper) {
            document.body.style.backgroundImage = `url(${savedWallpaper})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
        }
    }
    
    // ===== SETUP SETTINGS MODAL =====
    function setupSettingsModal() {
        const closeBtn = document.getElementById('closeSettingsModal');
        const saveBtn = document.getElementById('saveSettingsBtn');
        const resetBtn = document.getElementById('resetSettingsBtn');
        
        // Add wallpaper buttons to settings modal
        const settingsBody = document.querySelector('#settingsModal .modal-body');
        if (settingsBody && !document.getElementById('wallpaperSection')) {
            const wallpaperSection = document.createElement('div');
            wallpaperSection.id = 'wallpaperSection';
            wallpaperSection.className = 'settings-group';
            wallpaperSection.innerHTML = `
                <h4>🖼️ Fon rasmi</h4>
                <div class="setting-item">
                    <span>Galereyadan rasm tanlash</span>
                    <button id="setWallpaperBtn" style="background: #ff0000; border: none; padding: 6px 12px; border-radius: 20px; cursor: pointer;">Tanlash</button>
                </div>
                <div class="setting-item">
                    <span>Fon rasmini olib tashlash</span>
                    <button id="removeWallpaperBtn" style="background: #333; border: none; padding: 6px 12px; border-radius: 20px; cursor: pointer;">Olib tashlash</button>
                </div>
            `;
            settingsBody.appendChild(wallpaperSection);
            
            document.getElementById('setWallpaperBtn').onclick = () => window.setWallpaperFromGallery();
            document.getElementById('removeWallpaperBtn').onclick = () => window.removeWallpaper();
        }
        
        if (closeBtn) closeBtn.onclick = () => document.getElementById('settingsModal').style.display = 'none';
        if (saveBtn) saveBtn.onclick = () => window.saveSettings();
        if (resetBtn) resetBtn.onclick = () => window.resetSettings();
    }
    
    function init() {
        setupSettingsModal();
        loadSavedWallpaper();
        window.log("Settings.js loaded");
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
