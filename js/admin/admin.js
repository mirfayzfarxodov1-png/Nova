// ============================================
// NOVA - ADMIN PANEL (Mirfayz uchun)
// ============================================

(function() {
    "use strict";
    
    // Admin ekanligini tekshirish
    function isAdmin() {
        const userEmail = window.appState.currentUser.email;
        const userPhone = window.appState.currentUser.phone;
        return userEmail === 'mirfayzfarxodov1@gmail.com' || 
               userPhone === '+998938138110' ||
               localStorage.getItem('nova_admin_mode') === 'true';
    }
    
    // Admin panelni ko'rsatish
    window.showAdminPanel = function() {
        if (!isAdmin()) {
            window.showToast("❌ Bu sahifa faqat admin uchun!");
            return;
        }
        
        let modal = document.getElementById('adminModal');
        if (!modal) {
            modal = createAdminModal();
        }
        
        renderAdminDashboard();
        modal.style.display = 'flex';
    };
    
    function createAdminModal() {
        const modal = document.createElement('div');
        modal.id = 'adminModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px; width: 95%;">
                <div class="modal-header">
                    <h2><i class="fas fa-crown" style="color: #ffd700;"></i> Admin Panel - Mirfayz</h2>
                    <button class="close-modal" id="closeAdminModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="admin-tabs" style="display: flex; gap: 10px; border-bottom: 1px solid #ff000020; margin-bottom: 20px; flex-wrap: wrap;">
                        <button class="admin-tab active" data-tab="dashboard">📊 Dashboard</button>
                        <button class="admin-tab" data-tab="users">👥 Foydalanuvchilar</button>
                        <button class="admin-tab" data-tab="videos">📹 Videolar</button>
                        <button class="admin-tab" data-tab="reports">⚠️ Shikoyatlar</button>
                        <button class="admin-tab" data-tab="payments">💰 To'lovlar</button>
                        <button class="admin-tab" data-tab="settings">⚙️ Sozlamalar</button>
                    </div>
                    <div id="adminContent"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('closeAdminModal').onclick = () => modal.style.display = 'none';
        
        // Tab switching
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.onclick = () => {
                document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const tabName = tab.dataset.tab;
                renderAdminTab(tabName);
            };
        });
        
        return modal;
    }
    
    function renderAdminDashboard() {
        const container = document.getElementById('adminContent');
        const stats = {
            totalUsers: Object.keys(window.appState.users).length,
            totalVideos: window.appState.posts.length,
            totalLikes: window.appState.posts.reduce((sum, p) => sum + (p.likes || 0), 0),
            totalComments: window.appState.posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0),
            totalCoins: window.appState.currentUser.coins,
            pendingReports: JSON.parse(localStorage.getItem('nova_reports') || '[]').length
        };
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div class="admin-stat-card" style="background: #1a1a1a; padding: 20px; border-radius: 16px; text-align: center;">
                    <div style="font-size: 32px; color: #ff0000;">${stats.totalUsers}</div>
                    <div>Foydalanuvchilar</div>
                </div>
                <div class="admin-stat-card" style="background: #1a1a1a; padding: 20px; border-radius: 16px; text-align: center;">
                    <div style="font-size: 32px; color: #ff0000;">${stats.totalVideos}</div>
                    <div>Videolar</div>
                </div>
                <div class="admin-stat-card" style="background: #1a1a1a; padding: 20px; border-radius: 16px; text-align: center;">
                    <div style="font-size: 32px; color: #ff0000;">${stats.totalLikes.toLocaleString()}</div>
                    <div>Layklar</div>
                </div>
                <div class="admin-stat-card" style="background: #1a1a1a; padding: 20px; border-radius: 16px; text-align: center;">
                    <div style="font-size: 32px; color: #ff0000;">${stats.totalComments.toLocaleString()}</div>
                    <div>Kommentlar</div>
                </div>
                <div class="admin-stat-card" style="background: #1a1a1a; padding: 20px; border-radius: 16px; text-align: center;">
                    <div style="font-size: 32px; color: #ffd700;">${stats.totalCoins}</div>
                    <div>Nova Coin</div>
                </div>
                <div class="admin-stat-card" style="background: #1a1a1a; padding: 20px; border-radius: 16px; text-align: center;">
                    <div style="font-size: 32px; color: #ffaa00;">${stats.pendingReports}</div>
                    <div>Shikoyatlar</div>
                </div>
            </div>
            <div style="background: #1a1a1a; padding: 20px; border-radius: 16px;">
                <h3>📈 So'nggi faoliyat</h3>
                <div id="recentActivity"></div>
            </div>
        `;
        
        // Recent activity
        const recent = [...window.appState.posts].slice(0, 10);
        const activityDiv = document.getElementById('recentActivity');
        activityDiv.innerHTML = recent.map(p => `
            <div style="padding: 10px; border-bottom: 1px solid #333;">
                <strong>${window.escapeHtml(p.userName)}</strong> video yukladi: "${window.escapeHtml(p.caption)}"
                <span style="color: #888; font-size: 11px; margin-left: 10px;">${p.time}</span>
            </div>
        `).join('');
    }
    
    function renderAdminTab(tabName) {
        const container = document.getElementById('adminContent');
        
        if (tabName === 'users') {
            renderUsersTab(container);
        } else if (tabName === 'videos') {
            renderVideosTab(container);
        } else if (tabName === 'reports') {
            renderReportsTab(container);
        } else if (tabName === 'payments') {
            renderPaymentsTab(container);
        } else if (tabName === 'settings') {
            renderSettingsTab(container);
        } else {
            renderAdminDashboard();
        }
    }
    
    function renderUsersTab(container) {
        const users = Object.values(window.appState.users);
        container.innerHTML = `
            <div style="margin-bottom: 15px;">
                <input type="text" id="searchUser" placeholder="Foydalanuvchi qidirish..." class="form-input" style="width: 300px;">
            </div>
            <div id="usersList" style="max-height: 500px; overflow-y: auto;"></div>
        `;
        
        renderUsersList(users);
        
        document.getElementById('searchUser').oninput = (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = users.filter(u => u.name.toLowerCase().includes(query));
            renderUsersList(filtered);
        };
    }
    
    function renderUsersList(users) {
        const listDiv = document.getElementById('usersList');
        listDiv.innerHTML = users.map(user => `
            <div class="admin-user-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border-bottom: 1px solid #333;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${user.avatar}" style="width: 45px; height: 45px; border-radius: 50%;">
                    <div>
                        <div style="font-weight: 600;">${window.escapeHtml(user.name)}</div>
                        <div style="font-size: 11px; color: #888;">ID: ${user.id}</div>
                    </div>
                </div>
                <div>
                    <button class="admin-user-ban" data-id="${user.id}" style="background: #ff0000; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer;">🚫 Bloklash</button>
                    <button class="admin-user-delete" data-id="${user.id}" style="background: #ff0000; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer;">🗑️ O'chirish</button>
                </div>
            </div>
        `).join('');
    }
    
    function renderVideosTab(container) {
        container.innerHTML = `
            <div style="margin-bottom: 15px;">
                <input type="text" id="searchVideo" placeholder="Video qidirish..." class="form-input" style="width: 300px;">
            </div>
            <div id="videosList" style="max-height: 500px; overflow-y: auto;"></div>
        `;
        
        renderVideosList(window.appState.posts);
        
        document.getElementById('searchVideo').oninput = (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = window.appState.posts.filter(p => p.caption.toLowerCase().includes(query) || p.userName.toLowerCase().includes(query));
            renderVideosList(filtered);
        };
    }
    
    function renderVideosList(videos) {
        const listDiv = document.getElementById('videosList');
        listDiv.innerHTML = videos.map(video => `
            <div class="admin-video-item" style="display: flex; align-items: center; gap: 15px; padding: 12px; border-bottom: 1px solid #333;">
                <video src="${video.mediaUrl}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 8px;"></video>
                <div style="flex: 1;">
                    <div style="font-weight: 600;">${window.escapeHtml(video.caption)}</div>
                    <div style="font-size: 11px; color: #888;">${window.escapeHtml(video.userName)} | ❤️ ${video.likes || 0} | 💬 ${video.comments?.length || 0}</div>
                </div>
                <button class="admin-video-delete" data-id="${video.id}" style="background: #ff0000; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer;">🗑️ O'chirish</button>
            </div>
        `).join('');
        
        document.querySelectorAll('.admin-video-delete').forEach(btn => {
            btn.onclick = () => {
                if (confirm("Bu videoni o'chirmoqchimisiz?")) {
                    const videoId = btn.dataset.id;
                    window.appState.posts = window.appState.posts.filter(p => p.id !== videoId);
                    window.saveData();
                    window.renderFeed();
                    renderVideosList(window.appState.posts);
                    window.showToast("✅ Video o'chirildi!");
                }
            };
        });
    }
    
    function renderReportsTab(container) {
        const reports = JSON.parse(localStorage.getItem('nova_reports') || '[]');
        container.innerHTML = `
            <div id="reportsList" style="max-height: 500px; overflow-y: auto;">
                ${reports.length === 0 ? '<div style="text-align: center; padding: 40px; color: #888;">Shikoyatlar yo\'q</div>' : 
                    reports.map(r => `
                        <div class="report-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #333;">
                            <div>
                                <div>Post ID: ${r.postId}</div>
                                <div>Sabab: ${r.reason}</div>
                                <div style="font-size: 11px; color: #888;">${new Date(r.timestamp).toLocaleString()}</div>
                            </div>
                            <button class="report-resolve" data-id="${r.id}" style="background: #00cc00; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer;">✅ Hal qilindi</button>
                        </div>
                    `).join('')
                }
            </div>
        `;
        
        document.querySelectorAll('.report-resolve').forEach(btn => {
            btn.onclick = () => {
                const reportId = parseInt(btn.dataset.id);
                let reports = JSON.parse(localStorage.getItem('nova_reports') || '[]');
                reports = reports.filter(r => r.id !== reportId);
                localStorage.setItem('nova_reports', JSON.stringify(reports));
                renderReportsTab(container);
                window.showToast("✅ Shikoyat hal qilindi!");
            };
        });
    }
    
    function renderPaymentsTab(container) {
        const payments = JSON.parse(localStorage.getItem('nova_payments') || '[]');
        container.innerHTML = `
            <div id="paymentsList" style="max-height: 500px; overflow-y: auto;">
                ${payments.length === 0 ? '<div style="text-align: center; padding: 40px; color: #888;">To\'lovlar yo\'q</div>' : 
                    payments.map(p => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #333;">
                            <div>
                                <div>${window.escapeHtml(p.userName)}</div>
                                <div>${p.amount} ${p.currency} - ${p.item}</div>
                                <div style="font-size: 11px; color: #888;">${new Date(p.timestamp).toLocaleString()}</div>
                            </div>
                            <div>
                                <span style="background: ${p.status === 'completed' ? '#00cc00' : '#ffaa00'}; padding: 4px 8px; border-radius: 20px; font-size: 11px;">
                                    ${p.status === 'completed' ? '✅ Tasdiqlangan' : '⏳ Kutilmoqda'}
                                </span>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        `;
    }
    
    function renderSettingsTab(container) {
        container.innerHTML = `
            <div class="settings-group">
                <h3>⚙️ Umumiy sozlamalar</h3>
                <div class="setting-item"><span>Sayt nomi</span><input type="text" id="siteName" value="NOVA" class="form-input" style="width: 200px;"></div>
                <div class="setting-item"><span>Maintenance rejimi</span><input type="checkbox" id="maintenanceMode"></div>
                <div class="setting-item"><span>Ro'yxatdan o'tish</span><input type="checkbox" id="allowRegistration" checked></div>
            </div>
            <div class="settings-group">
                <h3>📧 Admin ma'lumotlari</h3>
                <div class="setting-item"><span>Admin email</span><input type="email" id="adminEmail" value="mirfayzfarxodov1@gmail.com" class="form-input"></div>
                <div class="setting-item"><span>Admin telefon</span><input type="tel" id="adminPhone" value="+998938138110" class="form-input"></div>
            </div>
            <button id="saveAdminSettings" class="btn btn-primary">Sozlamalarni saqlash</button>
        `;
        
        document.getElementById('saveAdminSettings').onclick = () => {
            localStorage.setItem('nova_site_name', document.getElementById('siteName').value);
            localStorage.setItem('nova_maintenance', document.getElementById('maintenanceMode').checked);
            window.showToast("✅ Sozlamalar saqlandi!");
        };
    }
    
    // Admin rejimini yoqish (testing uchun)
    window.enableAdminMode = function() {
        localStorage.setItem('nova_admin_mode', 'true');
        window.showToast("👑 Admin rejimi yoqildi!");
        location.reload();
    };
    
    window.log("Admin.js loaded");
})();
