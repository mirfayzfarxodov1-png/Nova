// ============================================
// NOVA - ANALYTICS.JS (Kanal statistikasi)
// ============================================

(function() {
    "use strict";
    
    window.showAnalytics = function() {
        const userPosts = window.appState.posts.filter(p => p.userId === window.appState.currentUser.id);
        
        const stats = {
            totalViews: userPosts.reduce((sum, p) => sum + (p.views || 0), 0),
            totalLikes: userPosts.reduce((sum, p) => sum + (p.likes || 0), 0),
            totalComments: userPosts.reduce((sum, p) => sum + (p.comments?.length || 0), 0),
            totalShares: userPosts.reduce((sum, p) => sum + (p.shares || 0), 0),
            bestVideo: userPosts.sort((a, b) => (b.likes || 0) - (a.likes || 0))[0],
            dailyGrowth: Math.floor(Math.random() * 100) + 10
        };
        
        let modal = document.getElementById('analyticsModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'analyticsModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-chart-line"></i> Kanal statistikasi</h3>
                        <button class="close-modal" id="closeAnalyticsModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                            <div class="stat-card" style="background: #1a1a1a; padding: 15px; border-radius: 12px; text-align: center;">
                                <div style="font-size: 28px; color: #ff0000;">${stats.totalViews.toLocaleString()}</div>
                                <div style="font-size: 12px;">Jami ko'rishlar</div>
                            </div>
                            <div class="stat-card" style="background: #1a1a1a; padding: 15px; border-radius: 12px; text-align: center;">
                                <div style="font-size: 28px; color: #ff0000;">${stats.totalLikes.toLocaleString()}</div>
                                <div style="font-size: 12px;">Jami layklar</div>
                            </div>
                            <div class="stat-card" style="background: #1a1a1a; padding: 15px; border-radius: 12px; text-align: center;">
                                <div style="font-size: 28px; color: #ff0000;">${stats.totalComments.toLocaleString()}</div>
                                <div style="font-size: 12px;">Jami kommentlar</div>
                            </div>
                            <div class="stat-card" style="background: #1a1a1a; padding: 15px; border-radius: 12px; text-align: center;">
                                <div style="font-size: 28px; color: #ff0000;">${stats.totalShares.toLocaleString()}</div>
                                <div style="font-size: 12px;">Jami ulashishlar</div>
                            </div>
                        </div>
                        <div style="background: #1a1a1a; padding: 15px; border-radius: 12px;">
                            <h4>📈 Eng yaxshi video</h4>
                            ${stats.bestVideo ? `
                                <div style="display: flex; gap: 10px; margin-top: 10px;">
                                    <video src="${stats.bestVideo.mediaUrl}" style="width: 80px; height: 80px; border-radius: 8px;"></video>
                                    <div>
                                        <div>${window.escapeHtml(stats.bestVideo.caption)}</div>
                                        <div style="font-size: 12px; color: #888;">❤️ ${stats.bestVideo.likes} | 👁️ ${stats.bestVideo.views || 0}</div>
                                    </div>
                                </div>
                            ` : '<div style="color: #888;">Hozircha video yo\'q</div>'}
                        </div>
                        <div style="margin-top: 15px; background: #1a1a1a; padding: 15px; border-radius: 12px;">
                            <h4>📊 O'sish ko'rsatkichi</h4>
                            <div style="height: 100px; display: flex; align-items: flex-end; gap: 10px; margin-top: 10px;">
                                ${[40, 55, 48, 62, 70, 85, stats.dailyGrowth].map((h, i) => `
                                    <div style="flex: 1; text-align: center;">
                                        <div style="height: ${h}px; background: #ff0000; border-radius: 4px; transition: height 0.3s;"></div>
                                        <div style="font-size: 10px; margin-top: 5px;">${i === 6 ? 'Bugun' : `${i+1}-kun`}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('closeAnalyticsModal').onclick = () => modal.style.display = 'none';
        }
        
        modal.style.display = 'flex';
    };
    
    window.log("Analytics.js loaded");
})();
