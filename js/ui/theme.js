// ============================================
// NOVA - THEME.JS (Dark/Light mode va ranglar)
// ============================================

(function() {
    "use strict";
    
    // ===== APPLY THEME =====
    window.applyTheme = function() {
        const isDark = window.appState.settings.darkMode;
        const accent = window.appState.settings.themeColor;
        
        // Background
        document.body.style.background = isDark ? '#000000' : '#ffffff';
        document.body.style.color = isDark ? '#ffffff' : '#000000';
        
        // Sidebar
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.style.background = isDark ? '#0a0a0a' : '#f5f5f5';
        }
        
        // Cards
        document.querySelectorAll('.post, .badge-card, .coin-card').forEach(el => {
            el.style.background = isDark ? '#0a0a0a' : '#f0f0f0';
        });
        
        // Theme color (CSS variable)
        let accentColor = accent === 'red' ? '#ff0000' : 
                          accent === 'blue' ? '#0066ff' : '#00cc00';
        document.documentElement.style.setProperty('--primary', accentColor);
        document.documentElement.style.setProperty('--primary-dark', accentColor + 'cc');
        document.documentElement.style.setProperty('--primary-light', accentColor + '33');
        
        // Update theme icon
        const themeIcon = document.getElementById('themeToggle');
        if (themeIcon) {
            themeIcon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
        }
        
        // Update body class
        if (isDark) {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
        }
    };
    
    // ===== TOGGLE DARK MODE =====
    window.toggleDarkMode = function() {
        window.appState.settings.darkMode = !window.appState.settings.darkMode;
        window.applyTheme();
        window.saveData();
        window.showToast(window.appState.settings.darkMode ? "Dark mode yoqildi" : "Light mode yoqildi");
    };
    
    // ===== CHANGE ACCENT COLOR =====
    window.changeAccentColor = function(color) {
        window.appState.settings.themeColor = color;
        window.applyTheme();
        window.saveData();
        window.showToast(`Rang o'zgartirildi: ${color}`);
    };
    
    // ===== CHANGE FONT SIZE =====
    window.changeFontSize = function(size) {
        window.appState.settings.fontSize = size;
        let fontSize = size === 'small' ? '12px' : size === 'large' ? '16px' : '14px';
        document.body.style.fontSize = fontSize;
        window.saveData();
        window.showToast(`Shrift o'lchami: ${size}`);
    };
    
    // ===== SETUP THEME TOGGLE =====
    function setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                window.toggleDarkMode();
            });
        }
    }
    
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
    
    function init() {
        setupThemeToggle();
        loadSavedWallpaper();
        window.log("Theme.js loaded");
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
