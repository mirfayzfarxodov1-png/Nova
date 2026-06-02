// ============================================
// NOVA - BADGES.JS (Galichkalar)
// ============================================

(function() {
    "use strict";
    
    // ===== SHOW PAYMENT MODAL =====
    window.showPaymentModal = function() {
        document.getElementById('paymentModal').style.display = 'flex';
    };
    
    // ===== CONFIRM PAYMENT =====
    window.confirmPayment = function() {
        const contact = document.getElementById('paymentContact').value;
        if (!contact || !contact.trim()) {
            window.showToast("❌ Iltimos, kontakt kiriting!");
            return;
        }
        
        document.getElementById('paymentModal').style.display = 'none';
        document.getElementById('verifyUser').textContent = window.appState.currentUser.name;
        document.getElementById('verifyModal').style.display = 'flex';
        window.showToast("💰 Chek Mirfayzga yuborildi! +998938138110");
    };
    
    // ===== APPROVE PAYMENT (Mirfayz) =====
    window.approvePayment = function() {
        window.appState.currentUser.hasBadge = true;
        document.getElementById('verifyModal').style.display = 'none';
        const badgeIcon = document.getElementById('badgeIcon');
        if (badgeIcon) badgeIcon.style.display = 'flex';
        window.saveData();
        window.updateUI();
        window.showToast("✅ Galichka tasdiqlandi!");
    };
    
    // ===== REJECT PAYMENT =====
    window.rejectPayment = function() {
        document.getElementById('verifyModal').style.display = 'none';
        window.showToast("❌ Galichka rad etildi. Pul qaytariladi.");
    };
    
    // ===== SETUP BADGE BUTTONS =====
    function setupBadgeButtons() {
        const badgeBtns = document.querySelectorAll('#badgeBtn, #badgeRightBtn');
        badgeBtns.forEach(btn => {
            btn.onclick = () => window.showPaymentModal();
        });
        
        const closePaymentModal = document.getElementById('closePaymentModal');
        if (closePaymentModal) {
            closePaymentModal.onclick = () => document.getElementById('paymentModal').style.display = 'none';
        }
        
        const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
        if (confirmPaymentBtn) {
            confirmPaymentBtn.onclick = () => window.confirmPayment();
        }
        
        const closeVerifyModal = document.getElementById('closeVerifyModal');
        if (closeVerifyModal) {
            closeVerifyModal.onclick = () => document.getElementById('verifyModal').style.display = 'none';
        }
        
        const approveBtn = document.getElementById('approvePayment');
        if (approveBtn) approveBtn.onclick = () => window.approvePayment();
        
        const rejectBtn = document.getElementById('rejectPayment');
        if (rejectBtn) rejectBtn.onclick = () => window.rejectPayment();
    }
    
    function init() {
        setupBadgeButtons();
        window.log("Badges.js loaded");
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
