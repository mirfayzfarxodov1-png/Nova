// ============================================
// NOVA - PREMIUM.JS (Premium obuna)
// ============================================

(function() {
    "use strict";
    
    // ===== SHOW PREMIUM MODAL =====
    window.showPremium = function() {
        const modal = document.getElementById('premiumModal');
        modal.style.display = 'flex';
    };
    
    // ===== ACTIVATE PREMIUM =====
    window.activatePremium = function(plan) {
        window.appState.currentUser.isPremium = true;
        window.appState.currentUser.premiumPlan = plan;
        window.appState.currentUser.premiumExpiry = new Date(Date.now() + (plan === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString();
        window.saveData();
        document.getElementById('premiumModal').style.display = 'none';
        window.showToast(`✅ ${plan === 'monthly' ? 'Premium' : 'Premium+'} obunasiga xush kelibsiz!`);
        
        // Apply premium features
        if (plan === 'yearly') {
            window.appState.currentUser.hasBadge = true;
            window.updateUI();
        }
    };
    
    // ===== SETUP PREMIUM MODAL =====
    function setupPremiumModal() {
        const premiumBtn = document.getElementById('premiumBtn');
        const closePremiumModal = document.getElementById('closePremiumModal');
        
        if (premiumBtn) premiumBtn.onclick = () => window.showPremium();
        if (closePremiumModal) closePremiumModal.onclick = () => document.getElementById('premiumModal').style.display = 'none';
        
        document.querySelectorAll('.premium-plan').forEach(plan => {
            plan.onclick = () => {
                const planType = plan.dataset.plan;
                window.activatePremium(planType);
            };
        });
    }
    
    function init() {
        setupPremiumModal();
        window.log("Premium.js loaded");
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
