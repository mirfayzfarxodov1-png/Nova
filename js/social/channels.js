// ============================================
// NOVA - CHANNELS.JS (Kanal tizimi)
// ============================================

(function() {
    "use strict";
    
    // ===== GO TO CHANNEL =====
    window.goToChannel = function(userId) {
        if (userId === window.appState.currentUser.id) {
            window.showToast("📺 Bu sizning kanalingiz!");
            return;
        }
        
        const user = window.appState.users[userId];
        if (!user) {
            window.showToast("❌ Foydalanuvchi topilmadi!");
            return;
        }
        
        const userPosts = window.appState.posts.filter(p => p.userId === userId);
        const isSubscribed = window.appState.subscriptions.includes(userId);
        
        // Show channel info in alert
        alert(`📺 KANAL: ${user.name}\n📹 Videolar: ${userPosts.length}\n👥 Obunachilar: ${window.appState.followers[userId]?.length || 0}\n🔔 Obuna: ${isSubscribed ? "✅ Obuna bo'lgansiz" : "❌ Obuna emassiz"}`);
        
        if (userPosts.length > 0) {
            window.renderCustomFeed(userPosts);
            window.showToast(`📺 ${user.name} kanaliga o'tdingiz`);
        } else {
            window.showToast(`📺 ${user.name} ning videolari yo'q`);
        }
    };
    
    // ===== RENDER STORIES =====
    window.renderStories = function() {
        const container = document.getElementById('storiesContainer');
        if (!container) return;
        
        const usersList = Object.values(window.appState.users).slice(0, 8);
        
        const uploadBtn = `
            <div class="story" id="storyUploadBtn">
                <div class="story-upload">
                    <i class="fas fa-plus"></i>
                </div>
                <div class="story-name">Sizning</div>
            </div>
        `;
        
        const storiesHtml = usersList.map(user => `
            <div class="story" onclick="window.goToChannel('${user.id}')">
                <div class="story-ring">
                    <img src="${user.avatar}" class="story-img" onerror="this.src='https://ui-avatars.com/api/?background=FF0000&color=fff&name=User'">
                </div>
                <div class="story-name">${window.escapeHtml(user.name).slice(0, 10)}</div>
            </div>
        `).join('');
        
        container.innerHTML = uploadBtn + storiesHtml;
        
        const storyUploadBtn = document.getElementById('storyUploadBtn');
        if (storyUploadBtn) {
            storyUploadBtn.onclick = () => {
                document.getElementById('uploadBtn').click();
            };
        }
    };
    
    // ===== UPDATE HASHTAGS =====
    window.updateHashtags = function() {
        const container = document.getElementById('hashtagList');
        if (!container) return;
        
        const hashtagCount = {};
        
        window.appState.posts.forEach(post => {
            const hashtags = post.caption?.match(/#[\w\u0400-\u04FF]+/g) || [];
            hashtags.forEach(tag => {
                const lowerTag = tag.toLowerCase();
                hashtagCount[lowerTag] = (hashtagCount[lowerTag] || 0) + 1;
            });
        });
        
        const topHashtags = Object.entries(hashtagCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        if (topHashtags.length === 0) {
            container.innerHTML = `
                <span class="hashtag" onclick="window.searchHashtag('#Nova')">#Nova</span>
                <span class="hashtag" onclick="window.searchHashtag('#MirfayzCreator')">#MirfayzCreator</span>
            `;
            return;
        }
        
        container.innerHTML = topHashtags.map(([tag]) => `
            <span class="hashtag" onclick="window.searchHashtag('${tag}')">${tag}</span>
        `).join('');
    };
    
    // ===== SEARCH HASHTAG =====
    window.searchHashtag = function(hashtag) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = hashtag;
        
        const filtered = window.appState.posts.filter(p => 
            p.caption?.toLowerCase().includes(hashtag.toLowerCase())
        );
        window.renderCustomFeed(filtered);
        window.showToast(`🔍 ${hashtag} bo'yicha ${filtered.length} ta video topildi`);
    };
    
    // ===== ADD NOTIFICATION =====
    window.addNotification = function(userId, message, type, postId = null) {
        window.appState.notifications.unshift({
            id: Date.now(),
            userId: userId,
            message: message,
            type: type,
            postId: postId,
            read: false,
            time: new Date().toLocaleString()
        });
        
        if (window.appState.notifications.length > 100) {
            window.appState.notifications = window.appState.notifications.slice(0, 100);
        }
        
        window.saveData();
        window.updateNotifBadge();
        window.showToast(message);
    };
    
    // ===== SHOW NOTIFICATIONS =====
    window.showNotifications = function() {
        const listDiv = document.getElementById('notificationsList');
        
        if (window.appState.notifications.length === 0) {
            listDiv.innerHTML = '<div style="text-align: center; padding: 20px; color: #888;">Hozircha ogohlantirishlar yo\'q</div>';
        } else {
            listDiv.innerHTML = window.appState.notifications.map(n => `
                <div style="padding: 12px; border-bottom: 1px solid #1a1a1a; ${n.read ? 'opacity: 0.6' : ''}">
                    <div>${window.escapeHtml(n.message)}</div>
                    <div style="font-size: 10px; color: #888;">${n.time}</div>
                </div>
            `).join('');
            
            window.appState.notifications.forEach(n => n.read = true);
            window.saveData();
            window.updateNotifBadge();
        }
        
        document.getElementById('notificationsModal').style.display = 'flex';
    };
    
    // ===== UPDATE NOTIFICATION BADGE =====
    window.updateNotifBadge = function() {
        const unread = window.appState.notifications.filter(n => !n.read).length;
        const badge = document.getElementById('notifBadge');
        if (badge) {
            badge.textContent = unread;
            badge.style.display = unread > 0 ? 'inline-block' : 'none';
        }
    };
    
    window.log("Channels.js loaded");
})();
