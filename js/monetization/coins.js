// ============================================
// NOVA - COINS.JS (Nova Coin tizimi)
// ============================================

(function() {
    "use strict";
    
    // ===== ADD COINS =====
    window.addCoins = function(amount, reason) {
        window.appState.currentUser.coins += amount;
        window.saveData();
        window.updateUI();
        window.showToast(`+${amount} Nova Coin (${reason})`);
        
        // Check level up (every 100 coins)
        const newLevel = Math.floor(window.appState.currentUser.coins / 100) + 1;
        if (newLevel > window.appState.currentUser.level) {
            window.appState.currentUser.level = newLevel;
            window.updateUI();
            window.showToast(`🎉 Tabriklaymiz! Siz ${newLevel}-darajaga chiqdingiz!`);
        }
    };
    
    // ===== SHOW COIN SHOP =====
    window.showCoinShop = function() {
        const modal = document.getElementById('coinShopModal');
        modal.style.display = 'flex';
    };
    
    // ===== BUY COINS =====
    window.buyCoins = function(coins, price) {
        window.addCoins(coins, `Coin sotib olindi: ${coins} coin`);
        document.getElementById('coinShopModal').style.display = 'none';
        window.showToast(`✅ ${coins} Nova Coin sotib olindi!`);
    };
    
    // ===== SETUP COIN SHOP =====
    function setupCoinShop() {
        const coinBtn = document.getElementById('coinBtn');
        const buyCoinsBtn = document.getElementById('buyCoinsBtn');
        const closeCoinModal = document.getElementById('closeCoinModal');
        
        if (coinBtn) coinBtn.onclick = () => window.showCoinShop();
        if (buyCoinsBtn) buyCoinsBtn.onclick = () => window.showCoinShop();
        if (closeCoinModal) closeCoinModal.onclick = () => document.getElementById('coinShopModal').style.display = 'none';
        
        document.querySelectorAll('.coin-package').forEach(pkg => {
            pkg.onclick = () => {
                const coins = parseInt(pkg.dataset.coins);
                window.buyCoins(coins);
            };
        });
    }
    
    function init() {
        setupCoinShop();
        window.log("Coins.js loaded");
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
