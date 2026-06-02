// ============================================
// NOVA - TOAST.JS (Bildirishnomalar tizimi)
// ============================================

(function() {
    "use strict";
    
    let toastQueue = [];
    let isShowingToast = false;
    
    // ===== SHOW TOAST =====
    window.showToast = function(message, duration = 3000, type = 'info') {
        toastQueue.push({ message, duration, type });
        if (!isShowingToast) {
            processToastQueue();
        }
    };
    
    // ===== PROCESS TOAST QUEUE =====
    function processToastQueue() {
        if (toastQueue.length === 0) {
            isShowingToast = false;
            return;
        }
        
        isShowingToast = true;
        const { message, duration, type } = toastQueue.shift();
        
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        
        // Set toast type style
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.display = 'block';
        
        // Add slide animation
        toast.style.animation = 'slideInRight 0.3s ease';
        
        setTimeout(() => {
            toast.style.animation = 'slideOutLeft 0.3s ease';
            setTimeout(() => {
                toast.style.display = 'none';
                processToastQueue();
            }, 300);
        }, duration);
    }
    
    // ===== SUCCESS TOAST =====
    window.showSuccess = function(message, duration = 3000) {
        window.showToast(message, duration, 'success');
    };
    
    // ===== ERROR TOAST =====
    window.showError = function(message, duration = 3000) {
        window.showToast(message, duration, 'error');
    };
    
    // ===== WARNING TOAST =====
    window.showWarning = function(message, duration = 3000) {
        window.showToast(message, duration, 'warning');
    };
    
    // ===== INFO TOAST =====
    window.showInfo = function(message, duration = 3000) {
        window.showToast(message, duration, 'info');
    };
    
    // Add toast styles
    const style = document.createElement('style');
    style.textContent = `
        .toast {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 40px;
            z-index: 10000;
            font-size: 14px;
            font-weight: 500;
            white-space: nowrap;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            display: none;
        }
        .toast-info {
            background: #1a1a1a;
            border-left: 4px solid #ff0000;
            color: #fff;
        }
        .toast-success {
            background: #1a1a1a;
            border-left: 4px solid #00cc00;
            color: #fff;
        }
        .toast-error {
            background: #1a1a1a;
            border-left: 4px solid #ff0000;
            color: #fff;
        }
        .toast-warning {
            background: #1a1a1a;
            border-left: 4px solid #ffaa00;
            color: #fff;
        }
        @keyframes slideOutLeft {
            from {
                transform: translateX(-50%);
                opacity: 1;
            }
            to {
                transform: translateX(-150%);
                opacity: 0;
            }
        }
        @media (max-width: 768px) {
            .toast {
                white-space: normal;
                text-align: center;
                max-width: 90%;
                font-size: 12px;
            }
        }
    `;
    document.head.appendChild(style);
    
    window.log("Toast.js loaded");
})();
