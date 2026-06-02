// ============================================
// NOVA - NOTIFICATIONS.JS (Ogohlantirishlar tizimi)
// ============================================

(function() {
    "use strict";
    
    // ===== ADD NOTIFICATION =====
    window.addNotification = function(userId, message, type, postId = null) {
        const notification = {
            id: Date.now(),
            userId: userId,
            message: message,
            type: type, // 'like', 'comment', 'subscribe', 'mention', 'follow'
            postId: postId,
            read: false,
            time: new Date().toISOString(),
            timeAgo: getTimeAgo(new Date())
        };
        
        window.appState.notifications.unshift(notification);
        
        // Keep only last 200 notifications
        if (window.appState.notifications.length > 200) {
            window.appState.notifications = window.appState.notifications.slice(0, 200);
        }
        
        window.saveData();
        window.updateNotifBadge();
        
        // Show toast for new notification
        if (type !== 'read') {
            showNotificationToast(message, type);
        }
        
        // Play sound if enabled
        if (window.appState.settings.soundEffects) {
            playNotificationSound();
        }
        
        // Send push notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('NOVA', { body: message, icon: '/assets/icons/icon-192.png' });
        }
    };
    
    // ===== GET TIME AGO =====
    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (seconds < 60) return 'hozir';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} soat`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} kun`;
        const weeks = Math.floor(days / 7);
        if (weeks < 4) return `${weeks} hafta`;
        const months = Math.floor(days / 30);
        if (months < 12) return `${months} oy`;
        return `${Math.floor(days / 365)} yil`;
    }
    
    // ===== SHOW NOTIFICATION TOAST =====
    function showNotificationToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `notification-toast notification-${type}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 40px; height: 40px; background: #ff0000; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="fas ${getNotificationIcon(type)}"></i>
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 13px;">NOVA</div>
                    <div style="font-size: 12px; color: #888;">${message}</div>
                </div>
            </div>
        `;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1a1a1a;
            border-radius: 12px;
            padding: 12px 16px;
            min-width: 280px;
            z-index: 10001;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            border-left: 4px solid #ff0000;
            animation: slideInRight 0.3s ease;
            cursor: pointer;
        `;
        document.body.appendChild(toast);
        
        toast.onclick = () => {
            window.showNotifications();
            toast.remove();
        };
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }
    
    function getNotificationIcon(type) {
        switch(type) {
            case 'like': return 'fa-heart';
            case 'comment': return 'fa-comment';
            case 'subscribe': return 'fa-bell';
            case 'mention': return 'fa-at';
            case 'follow': return 'fa-user-plus';
            default: return 'fa-bell';
        }
    }
    
    function playNotificationSound() {
        const audio = new Audio('/assets/sounds/notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Sound play error:', e));
    }
    
    // ===== UPDATE NOTIFICATION BADGE =====
    window.updateNotifBadge = function() {
        const unread = window.appState.notifications.filter(n => !n.read).length;
        const badge = document.getElementById('notifBadge');
        if (badge) {
            badge.textContent = unread;
            badge.style.display = unread > 0 ? 'inline-block' : 'none';
        }
        
        // Update browser title
        if (unread > 0) {
            document.title = `(${unread}) NOVA – Mirfayz Creator`;
        } else {
            document.title = `NOVA – Mirfayz Creator`;
        }
    };
    
    // ===== SHOW NOTIFICATIONS MODAL =====
    window.showNotifications = function() {
        const listDiv = document.getElementById('notificationsList');
        
        if (window.appState.notifications.length === 0) {
            listDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #888;">
                    <i class="fas fa-bell-slash" style="font-size: 48px; margin-bottom: 15px;"></i>
                    <p>Hozircha ogohlantirishlar yo'q</p>
                </div>
            `;
        } else {
            listDiv.innerHTML = window.appState.notifications.map(n => `
                <div class="notification-item ${n.read ? 'read' : 'unread'}" data-id="${n.id}" data-post-id="${n.postId}" style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 15px;
                    border-bottom: 1px solid #1a1a1a;
                    cursor: pointer;
                    background: ${n.read ? 'transparent' : 'rgba(255,0,0,0.05)'};
                    transition: background 0.2s;
                ">
                    <div style="width: 45px; height: 45px; background: ${n.read ? '#1a1a1a' : '#ff000020'}; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas ${getNotificationIcon(n.type)}" style="color: #ff0000;"></i>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-size: 13px;">${window.escapeHtml(n.message)}</div>
                        <div style="font-size: 11px; color: #888; margin-top: 3px;">${n.timeAgo}</div>
                    </div>
                    ${!n.read ? '<div style="width: 8px; height: 8px; background: #ff0000; border-radius: 50%;"></div>' : ''}
                </div>
            `).join('');
            
            // Mark all as read when opened
            window.appState.notifications.forEach(n => n.read = true);
            window.saveData();
            window.updateNotifBadge();
            
            // Add click handlers
            document.querySelectorAll('.notification-item').forEach(item => {
                item.onclick = () => {
                    const postId = item.dataset.postId;
                    if (postId) {
                        window.closeAllModals();
                        // Scroll to post
                        const postElement = document.querySelector(`.post[data-post-id="${postId}"]`);
                        if (postElement) {
                            postElement.scrollIntoView({ behavior: 'smooth' });
                            postElement.style.border = '2px solid #ff0000';
                            setTimeout(() => {
                                postElement.style.border = '';
                            }, 2000);
                        }
                    }
                    document.getElementById('notificationsModal').style.display = 'none';
                };
            });
        }
        
        document.getElementById('notificationsModal').style.display = 'flex';
    };
    
    // ===== REQUEST NOTIFICATION PERMISSION =====
    window.requestNotificationPermission = function() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    window.showToast("✅ Bildirishnomalar yoqildi!");
                }
            });
        }
    };
    
    // ===== MARK NOTIFICATION AS READ =====
    window.markNotificationAsRead = function(notificationId) {
        const notification = window.appState.notifications.find(n => n.id == notificationId);
        if (notification) {
            notification.read = true;
            window.saveData();
            window.updateNotifBadge();
        }
    };
    
    // ===== CLEAR ALL NOTIFICATIONS =====
    window.clearAllNotifications = function() {
        if (confirm("Barcha ogohlantirishlarni o'chirmoqchimisiz?")) {
            window.appState.notifications = [];
            window.saveData();
            window.updateNotifBadge();
            window.showToast("✅ Barcha ogohlantirishlar o'chirildi!");
            window.showNotifications();
        }
    };
    
    window.log("Notifications.js loaded");
})();
