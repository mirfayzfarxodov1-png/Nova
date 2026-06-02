// ============================================
// NOVA - SHOP.JS (Do'kon tizimi)
// ============================================

(function() {
    "use strict";
    
    const SHOP_ITEMS = [
        { id: 'badge_gold', name: 'Oltin galichka', price: 500, icon: '👑', type: 'badge', description: 'Maxsus oltin galichka' },
        { id: 'badge_rainbow', name: 'Rainbow galichka', price: 1000, icon: '🌈', type: 'badge', description: 'Animatsiyali rainbow galichka' },
        { id: 'theme_dark', name: 'Dark tema', price: 200, icon: '🌙', type: 'theme', description: 'Maxsus dark tema' },
        { id: 'emoji_pack', name: 'Emoji paketi', price: 100, icon: '😎', type: 'emoji', description: '100+ eksklyuziv emoji' },
        { id: 'sticker_pack', name: 'Stiker paketi', price: 150, icon: '🎨', type: 'sticker', description: '50+ eksklyuziv stiker' },
        { id: 'frame_premium', name: 'Premium ramka', price: 300, icon: '🖼️', type: 'frame', description: 'Profil uchun maxsus ramka' }
    ];
    
    // ===== SHOW SHOP =====
    window.showShop = function() {
        let modal = document.getElementById('shopModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'shopModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-store"></i> Nova Do'kon</h3>
                        <button class="close-modal" id="closeShopModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <div style="background: linear-gradient(135deg, #ffd70020, #ffaa0020); border-radius: 16px; padding: 15px; display: inline-block;">
                                <i class="fas fa-coins" style="color: #ffd700; font-size: 24px;"></i>
                                <span style="font-size: 24px; font-weight: bold; margin-left: 10px;" id="shopCoinAmount">${window.appState.currentUser.coins}</span>
                            </div>
                        </div>
                        <div id="shopItemsContainer" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('closeShopModal').onclick = () => modal.style.display = 'none';
        }
        
        updateShopCoinDisplay();
        renderShopItems();
        modal.style.display = 'flex';
    };
    
    function updateShopCoinDisplay() {
        const coinDisplay = document.getElementById('shopCoinAmount');
        if (coinDisplay) {
            coinDisplay.textContent = window.appState.currentUser.coins;
        }
    }
    
    function renderShopItems() {
        const container = document.getElementById('shopItemsContainer');
        const purchasedItems = JSON.parse(localStorage.getItem('nova_purchased') || '[]');
        
        container.innerHTML = SHOP_ITEMS.map(item => {
            const isPurchased = purchasedItems.includes(item.id);
            return `
                <div class="shop-item" data-id="${item.id}" style="
                    background: #1a1a1a;
                    border: 1px solid ${isPurchased ? '#00cc00' : '#ff0000'};
                    border-radius: 16px;
                    padding: 15px;
                    text-align: center;
                    transition: transform 0.2s;
                ">
                    <div style="font-size: 48px;">${item.icon}</div>
                    <div style="font-weight: 600; margin: 10px 0;">${item.name}</div>
                    <div style="font-size: 12px; color: #888; margin-bottom: 10px;">${item.description}</div>
                    <div style="display: flex; align-items: center; justify-content: center; gap: 5px; margin-bottom: 10px;">
                        <i class="fas fa-coins" style="color: #ffd700;"></i>
                        <span style="font-weight: bold;">${item.price}</span>
                    </div>
                    ${isPurchased ? 
                        '<button style="background: #00cc00; border: none; padding: 8px; border-radius: 30px; width: 100%; cursor: pointer;" disabled>Sotib olingan</button>' :
                        `<button class="buy-item-btn" data-id="${item.id}" data-price="${item.price}" style="background: #ff0000; border: none; padding: 8px; border-radius: 30px; width: 100%; cursor: pointer;">Sotib olish</button>`
                    }
                </div>
            `;
        }).join('');
        
        document.querySelectorAll('.buy-item-btn').forEach(btn => {
            btn.onclick = () => {
                const itemId = btn.dataset.id;
                const price = parseInt(btn.dataset.price);
                buyItem(itemId, price);
            };
        });
    }
    
    function buyItem(itemId, price) {
        if (window.appState.currentUser.coins >= price) {
            window.appState.currentUser.coins -= price;
            window.saveData();
            window.updateUI();
            
            const purchased = JSON.parse(localStorage.getItem('nova_purchased') || '[]');
            purchased.push(itemId);
            localStorage.setItem('nova_purchased', JSON.stringify(purchased));
            
            window.showToast(`✅ ${SHOP_ITEMS.find(i => i.id === itemId).name} sotib olindi!`);
            updateShopCoinDisplay();
            renderShopItems();
            
            // Apply item effect
            applyItemEffect(itemId);
        } else {
            window.showToast("❌ Yetarli Nova Coin mavjud emas!");
        }
    }
    
    function applyItemEffect(itemId) {
        switch(itemId) {
            case 'badge_gold':
                window.appState.currentUser.hasBadge = true;
                window.updateUI();
                break;
            case 'theme_dark':
                if (!window.appState.settings.darkMode) {
                    window.toggleDarkMode();
                }
                break;
        }
        window.saveData();
    }
    
    window.log("Shop.js loaded");
})();
