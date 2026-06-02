// ============================================
// NOVA - MODAL.JS (Modal oynalar tizimi)
// ============================================

(function() {
    "use strict";
    
    // ===== OPEN MODAL =====
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Animation
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.style.animation = 'slideInUp 0.3s ease';
            }
        }
    };
    
    // ===== CLOSE MODAL =====
    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.style.animation = 'slideOutDown 0.2s ease';
                setTimeout(() => {
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                }, 200);
            } else {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        }
    };
    
    // ===== CLOSE ALL MODALS =====
    window.closeAllModals = function() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = '';
    };
    
    // ===== SETUP MODAL CLOSE ON OVERLAY CLICK =====
    function setupModalCloseOnOverlay() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    window.closeModal(modal.id);
                }
            });
        });
    }
    
    // ===== SETUP MODAL CLOSE BUTTONS =====
    function setupModalCloseButtons() {
        document.querySelectorAll('.close-modal').forEach(btn => {
            const modal = btn.closest('.modal');
            if (modal) {
                btn.addEventListener('click', () => {
                    window.closeModal(modal.id);
                });
            }
        });
    }
    
    // ===== ANIMATIONS =====
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInUp {
            from {
                transform: translateY(50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        @keyframes slideOutDown {
            from {
                transform: translateY(0);
                opacity: 1;
            }
            to {
                transform: translateY(50px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    function init() {
        setupModalCloseOnOverlay();
        setupModalCloseButtons();
        window.log("Modal.js loaded");
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
