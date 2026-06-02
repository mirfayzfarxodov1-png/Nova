// ============================================
// NOVA - BACKUP.JS (Ma'lumotlarni backup va tiklash)
// Google Drive, iCloud, Local backup
// ============================================

(function() {
    "use strict";
    
    let backupInterval = null;
    
    // ===== BACKUP PANELINI KO'RSATISH =====
    window.showBackupPanel = function() {
        let modal = document.getElementById('backupModal');
        if (!modal) {
            modal = createBackupModal();
        }
        
        updateBackupInfo();
        modal.style.display = 'flex';
    };
    
    function createBackupModal() {
        const modal = document.createElement('div');
        modal.id = 'backupModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3><i class="fas fa-cloud-upload-alt"></i> Ma'lumotlar backup</h3>
                    <button class="close-modal" id="closeBackupModal">&times;</button>
                </div>
                <div class="modal-body">
                    <!-- Backup Info -->
                    <div class="backup-info" style="background: #1a1a1a; border-radius: 16px; padding: 15px; margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>📊 Ma'lumotlar hajmi:</span>
                            <span id="backupSize">0 KB</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>📅 Oxirgi backup:</span>
                            <span id="lastBackup">Hech qachon</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>🔄 Avtomatik backup:</span>
                            <span id="autoBackupStatus">❌ O'chirilgan</span>
                        </div>
                    </div>
                    
                    <!-- Backup Types -->
                    <div class="backup-types" style="display: grid; gap: 15px;">
                        <div class="backup-option" data-type="local" style="background: #1a1a1a; border-radius: 16px; padding: 15px; cursor: pointer; border: 1px solid #ff000020; transition: all 0.3s;">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="width: 50px; height: 50px; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-database" style="font-size: 24px;"></i>
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600;">Local backup</div>
                                    <div style="font-size: 12px; color: #888;">Kompyuteringizga saqlash</div>
                                </div>
                                <i class="fas fa-chevron-right" style="color: #888;"></i>
                            </div>
                        </div>
                        
                        <div class="backup-option" data-type="google" style="background: #1a1a1a; border-radius: 16px; padding: 15px; cursor: pointer; border: 1px solid #ff000020; transition: all 0.3s;">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="width: 50px; height: 50px; background: #4285f4; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                    <i class="fab fa-google-drive" style="font-size: 24px; color: #fff;"></i>
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600;">Google Drive</div>
                                    <div style="font-size: 12px; color: #888;">Bulutga saqlash</div>
                                </div>
                                <i class="fas fa-chevron-right" style="color: #888;"></i>
                            </div>
                        </div>
                        
                        <div class="backup-option" data-type="icloud" style="background: #1a1a1a; border-radius: 16px; padding: 15px; cursor: pointer; border: 1px solid #ff000020; transition: all 0.3s;">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="width: 50px; height: 50px; background: #000; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                    <i class="fab fa-apple" style="font-size: 24px; color: #fff;"></i>
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600;">iCloud</div>
                                    <div style="font-size: 12px; color: #888;">Apple bulutiga saqlash</div>
                                </div>
                                <i class="fas fa-chevron-right" style="color: #888;"></i>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Auto Backup Settings -->
                    <div class="auto-backup-settings" style="margin-top: 20px; background: #1a1a1a; border-radius: 16px; padding: 15px;">
                        <h4 style="margin-bottom: 10px;">🔄 Avtomatik backup</h4>
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                            <span>Har kuni avtomatik backup</span>
                            <input type="checkbox" id="autoBackupToggle">
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <select id="backupTime" class="form-input" style="width: auto; flex: 1;">
                                <option value="0">00:00</option>
                                <option value="1">01:00</option>
                                <option value="2">02:00</option>
                                <option value="3">03:00</option>
                                <option value="6">06:00</option>
                                <option value="9">09:00</option>
                                <option value="12">12:00</option>
                                <option value="15">15:00</option>
                                <option value="18">18:00</option>
                                <option value="21">21:00</option>
                            </select>
                            <button id="saveAutoBackupBtn" class="btn btn-primary">Saqlash</button>
                        </div>
                    </div>
                    
                    <!-- Restore Section -->
                    <div class="restore-section" style="margin-top: 20px; background: #1a1a1a; border-radius: 16px; padding: 15px;">
                        <h4 style="margin-bottom: 10px;">📂 Backup dan tiklash</h4>
                        <div class="restore-option" data-restore="local" style="display: flex; align-items: center; justify-content: space-between; padding: 10px; cursor: pointer; border-bottom: 1px solid #333;">
                            <span><i class="fas fa-file-import"></i> Local fayldan tiklash</span>
                            <i class="fas fa-chevron-right" style="color: #888;"></i>
                        </div>
                        <div class="restore-option" data-restore="google" style="display: flex; align-items: center; justify-content: space-between; padding: 10px; cursor: pointer;">
                            <span><i class="fab fa-google-drive"></i> Google Drive dan tiklash</span>
                            <i class="fas fa-chevron-right" style="color: #888;"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('closeBackupModal').onclick = () => modal.style.display = 'none';
        
        // Backup options
        document.querySelectorAll('.backup-option').forEach(opt => {
            opt.onclick = () => {
                const type = opt.dataset.type;
                performBackup(type);
            };
        });
        
        // Restore options
        document.querySelectorAll('.restore-option').forEach(opt => {
            opt.onclick = () => {
                const type = opt.dataset.restore;
                performRestore(type);
            };
        });
        
        // Auto backup settings
        document.getElementById('autoBackupToggle').onchange = (e) => {
            if (e.target.checked) {
                startAutoBackup();
            } else {
                stopAutoBackup();
            }
        };
        
        document.getElementById('saveAutoBackupBtn').onclick = () => {
            const time = document.getElementById('backupTime').value;
            localStorage.setItem('nova_auto_backup_time', time);
            if (document.getElementById('autoBackupToggle').checked) {
                startAutoBackup();
            }
            window.showToast("✅ Avtomatik backup sozlamalari saqlandi!");
        };
        
        return modal;
    }
    
    // ===== UPDATE BACKUP INFO =====
    function updateBackupInfo() {
        const data = exportAllData();
        const jsonStr = JSON.stringify(data);
        const size = (jsonStr.length / 1024).toFixed(2);
        document.getElementById('backupSize').textContent = `${size} KB`;
        
        const lastBackup = localStorage.getItem('nova_last_backup');
        if (lastBackup) {
            document.getElementById('lastBackup').textContent = new Date(parseInt(lastBackup)).toLocaleString();
        }
        
        const autoBackup = localStorage.getItem('nova_auto_backup');
        if (autoBackup === 'true') {
            document.getElementById('autoBackupStatus').innerHTML = '✅ Yoqilgan';
            document.getElementById('autoBackupToggle').checked = true;
            const savedTime = localStorage.getItem('nova_auto_backup_time');
            if (savedTime) {
                document.getElementById('backupTime').value = savedTime;
            }
        }
    }
    
    // ===== EXPORT ALL DATA =====
    function exportAllData() {
        return {
            user: window.appState.currentUser,
            posts: window.appState.posts,
            followers: window.appState.followers,
            notifications: window.appState.notifications,
            subscriptions: window.appState.subscriptions,
            chats: window.appState.chats,
            messages: window.appState.messages,
            settings: window.appState.settings,
            groups: JSON.parse(localStorage.getItem('nova_groups') || '[]'),
            exportDate: new Date().toISOString(),
            version: '2.0.0'
        };
    }
    
    // ===== PERFORM BACKUP =====
    function performBackup(type) {
        window.showLoader();
        
        const data = exportAllData();
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        
        setTimeout(() => {
            window.hideLoader();
            
            switch(type) {
                case 'local':
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `nova_backup_${new Date().toISOString().slice(0, 19)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    window.showToast("✅ Local backup yaratildi!");
                    break;
                    
                case 'google':
                    window.showToast("📤 Google Drive ga yuborilmoqda...");
                    // Google Drive API integration would go here
                    setTimeout(() => {
                        window.showToast("✅ Google Drive ga saqlandi! (Demo)");
                    }, 2000);
                    break;
                    
                case 'icloud':
                    window.showToast("📤 iCloud ga yuborilmoqda...");
                    setTimeout(() => {
                        window.showToast("✅ iCloud ga saqlandi! (Demo)");
                    }, 2000);
                    break;
            }
            
            localStorage.setItem('nova_last_backup', Date.now().toString());
            updateBackupInfo();
        }, 1000);
    }
    
    // ===== PERFORM RESTORE =====
    function performRestore(type) {
        if (type === 'local') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const data = JSON.parse(ev.target.result);
                        restoreData(data);
                    } catch(err) {
                        window.showToast("❌ Xato: noto'g'ri fayl formati!");
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        } else if (type === 'google') {
            window.showToast("📥 Google Drive dan yuklanmoqda...");
            setTimeout(() => {
                window.showToast("✅ Google Drive dan tiklandi! (Demo)");
            }, 2000);
        }
    }
    
    // ===== RESTORE DATA =====
    function restoreData(data) {
        if (confirm("Barcha ma'lumotlar tiklanadi. Davom etilsinmi?")) {
            if (data.user) window.appState.currentUser = { ...window.appState.currentUser, ...data.user };
            if (data.posts) window.appState.posts = data.posts;
            if (data.followers) window.appState.followers = data.followers;
            if (data.notifications) window.appState.notifications = data.notifications;
            if (data.subscriptions) window.appState.subscriptions = data.subscriptions;
            if (data.chats) window.appState.chats = data.chats;
            if (data.messages) window.appState.messages = data.messages;
            if (data.settings) window.appState.settings = { ...window.appState.settings, ...data.settings };
            if (data.groups) localStorage.setItem('nova_groups', JSON.stringify(data.groups));
            
            window.saveData();
            window.loadData();
            window.updateUI();
            window.showToast("✅ Ma'lumotlar tiklandi!");
            document.getElementById('backupModal').style.display = 'none';
        }
    }
    
    // ===== AUTO BACKUP =====
    function startAutoBackup() {
        localStorage.setItem('nova_auto_backup', 'true');
        
        if (backupInterval) clearInterval(backupInterval);
        
        const checkInterval = setInterval(() => {
            const now = new Date();
            const currentHour = now.getHours();
            const backupHour = parseInt(localStorage.getItem('nova_auto_backup_time') || '3');
            
            const lastBackupDate = localStorage.getItem('nova_last_backup_date');
            const today = now.toDateString();
            
            if (currentHour === backupHour && lastBackupDate !== today) {
                performBackup('local');
                localStorage.setItem('nova_last_backup_date', today);
            }
        }, 3600000); // Check every hour
        
        backupInterval = checkInterval;
        window.showToast("✅ Avtomatik backup yoqildi!");
    }
    
    function stopAutoBackup() {
        localStorage.setItem('nova_auto_backup', 'false');
        if (backupInterval) {
            clearInterval(backupInterval);
            backupInterval = null;
        }
        window.showToast("❌ Avtomatik backup o'chirildi!");
    }
    
    // ===== SIDEBARGA BACKUP TUGMASI =====
    function addBackupButton() {
        const sidebarFooter = document.querySelector('.sidebar-footer');
        if (sidebarFooter && !document.querySelector('.backup-btn')) {
            const backupBtn = document.createElement('button');
            backupBtn.className = 'premium-btn backup-btn';
            backupBtn.style.marginTop = '10px';
            backupBtn.style.background = '#333';
            backupBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Backup';
            backupBtn.onclick = () => window.showBackupPanel();
            sidebarFooter.appendChild(backupBtn);
        }
    }
    
    // ===== CHECK FOR BACKUP ON STARTUP =====
    function checkBackupOnStartup() {
        const autoBackup = localStorage.getItem('nova_auto_backup');
        if (autoBackup === 'true') {
            startAutoBackup();
        }
    }
    
    function init() {
        addBackupButton();
        checkBackupOnStartup();
        window.log("Backup.js loaded");
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    window.log("Backup.js loaded");
})();
