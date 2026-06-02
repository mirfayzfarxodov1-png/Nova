// ============================================
// NOVA - FOLLOWS.JS (Obuna tizimi)
// ============================================

(function() {
    "use strict";
    
    // ===== TOGGLE SUBSCRIBE =====
    window.toggleSubscribe = function(userId) {
        if (userId === window.appState.currentUser.id) {
            window.showToast("❌ O'zingizga obuna bo'la olmaysiz!");
            return;
        }
        
        const index = window.appState.subscriptions.indexOf(userId);
        
        if (index === -1) {
            // Subscribe
            window.appState.subscriptions.push(userId);
            
            if (!window.appState.followers[userId]) {
                window.appState.followers[userId] = [];
            }
            if (!window.appState.followers[userId].includes(window.appState.currentUser.id)) {
                window.appState.followers[userId].push(window.appState.currentUser.id);
            }
            
            window.addNotification(
                userId,
                `${window.appState.currentUser.name} sizga obuna bo'ldi!`,
                'subscribe'
            );
            window.showToast(`✅ ${window.appState.users[userId]?.name || 'Kanal'} ga obuna bo'ldingiz!`);
            
            // Add coins
            window.appState.currentUser.coins += 10;
            window.saveData();
            window.updateUI();
        } else {
            // Unsubscribe
            window.appState.subscriptions.splice(index, 1);
            
            if (window.appState.followers[userId]) {
                window.appState.followers[userId] = window.appState.followers[userId].filter(
                    id => id !== window.appState.currentUser.id
                );
            }
            
            window.showToast(`❌ Obuna bekor qilindi`);
        }
        
        window.saveData();
        window.renderSuggestions();
        window.updateUI();
        window.renderFeed();
        
        // Update reels if open
        if (document.getElementById('reelsContainer').style.display === 'block') {
            window.showReels();
        }
    };
    
    // ===== RENDER SUGGESTIONS =====
    window.renderSuggestions = function() {
        const container = document.getElementById('suggestionsList');
        if (!container) return;
        
        const otherUsers = Object.values(window.appState.users)
            .filter(u => u.id !== window.appState.currentUser.id && !window.appState.subscriptions.includes(u.id))
            .slice(0, 5);
        
        if (otherUsers.length === 0) {
            container.innerHTML = '<div style="color: #888; text-align: center; padding: 10px;">Takliflar yo\'q</div>';
            return;
        }
        
        container.innerHTML = otherUsers.map(user => `
            <div class="suggestion-item" onclick="window.goToChannel('${user.id}')">
                <div class="suggestion-user">
                    <img src="${user.avatar}" onerror="this.src='https://ui-avatars.com/api/?background=FF0000&color=fff&name=User'">
                    <div>
                        <div style="font-weight: 600;">${window.escapeHtml(user.name)}</div>
                        <div style="font-size: 11px; color: #888;">${window.appState.followers[user.id]?.length || 0} obunachi</div>
                    </div>
                </div>
                <button class="follow-btn" onclick="event.stopPropagation(); window.toggleSubscribe('${user.id}')">Obuna</button>
            </div>
        `).join('');
    };
    
    window.log("Follows.js loaded");
})();
