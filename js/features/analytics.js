// ============================================
// NOVA - ANALYTICS.JS (Kengaytirilgan statistika)
// Kanal o'sishi, grafiklar, demografiya
// ============================================

(function() {
    "use strict";
    
    let analyticsChart = null;
    let currentPeriod = 'week'; // week, month, year
    
    // ===== ANALYTICS PANELINI KO'RSATISH =====
    window.showAnalytics = function() {
        let modal = document.getElementById('analyticsModal');
        if (!modal) {
            modal = createAnalyticsModal();
        }
        
        loadAnalyticsData();
        modal.style.display = 'flex';
    };
    
    function createAnalyticsModal() {
        const modal = document.createElement('div');
        modal.id = 'analyticsModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px; width: 95%; max-height: 85vh;">
                <div class="modal-header">
                    <h2><i class="fas fa-chart-line" style="color: #ff0000;"></i> Kanal statistikasi</h2>
                    <button class="close-modal" id="closeAnalyticsModal">&times;</button>
                </div>
                <div class="modal-body">
                    <!-- Period filters -->
                    <div class="analytics-filters" style="display: flex; gap: 10px; border-bottom: 1px solid #ff000020; margin-bottom: 20px; padding-bottom: 10px;">
                        <button class="period-filter-btn active" data-period="week">📅 Hafta</button>
                        <button class="period-filter-btn" data-period="month">📆 Oy</button>
                        <button class="period-filter-btn" data-period="year">🗓️ Yil</button>
                    </div>
                    
                    <!-- Overview Stats -->
                    <div class="analytics-stats" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px;">
                        <div class="stat-card" style="background: #1a1a1a; padding: 15px; border-radius: 16px;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                <i class="fas fa-eye" style="color: #ff0000; font-size: 20px;"></i>
                                <span style="color: #888;">Jami ko'rishlar</span>
                            </div>
                            <div id="totalViews" style="font-size: 28px; font-weight: bold;">0</div>
                            <div id="viewsGrowth" style="font-size: 12px; color: #00cc00;">+0%</div>
                        </div>
                        <div class="stat-card" style="background: #1a1a1a; padding: 15px; border-radius: 16px;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                <i class="fas fa-heart" style="color: #ff0000; font-size: 20px;"></i>
                                <span style="color: #888;">Jami layklar</span>
                            </div>
                            <div id="totalLikes" style="font-size: 28px; font-weight: bold;">0</div>
                            <div id="likesGrowth" style="font-size: 12px; color: #00cc00;">+0%</div>
                        </div>
                        <div class="stat-card" style="background: #1a1a1a; padding: 15px; border-radius: 16px;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                <i class="fas fa-users" style="color: #ff0000; font-size: 20px;"></i>
                                <span style="color: #888;">Obunachilar</span>
                            </div>
                            <div id="totalFollowers" style="font-size: 28px; font-weight: bold;">0</div>
                            <div id="followersGrowth" style="font-size: 12px; color: #00cc00;">+0%</div>
                        </div>
                        <div class="stat-card" style="background: #1a1a1a; padding: 15px; border-radius: 16px;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                <i class="fas fa-coins" style="color: #ffd700; font-size: 20px;"></i>
                                <span style="color: #888;">Nova Coin</span>
                            </div>
                            <div id="totalCoins" style="font-size: 28px; font-weight: bold;">0</div>
                            <div id="coinsGrowth" style="font-size: 12px; color: #00cc00;">+0%</div>
                        </div>
                    </div>
                    
                    <!-- Growth Chart -->
                    <div style="background: #1a1a1a; border-radius: 16px; padding: 20px; margin-bottom: 25px;">
                        <h3 style="margin-bottom: 15px;"><i class="fas fa-chart-line"></i> Kanal o'sishi</h3>
                        <canvas id="growthChart" style="width: 100%; height: 300px;"></canvas>
                    </div>
                    
                    <!-- Best Videos -->
                    <div style="background: #1a1a1a; border-radius: 16px; padding: 20px; margin-bottom: 25px;">
                        <h3 style="margin-bottom: 15px;"><i class="fas fa-trophy"></i> Eng mashhur videolar</h3>
                        <div id="bestVideos" style="display: flex; flex-direction: column; gap: 10px;"></div>
                    </div>
                    
                    <!-- Demographics -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                        <div style="background: #1a1a1a; border-radius: 16px; padding: 20px;">
                            <h3 style="margin-bottom: 15px;"><i class="fas fa-clock"></i> Eng faol vaqtlar</h3>
                            <div id="activeHours"></div>
                        </div>
                        <div style="background: #1a1a1a; border-radius: 16px; padding: 20px;">
                            <h3 style="margin-bottom: 15px;"><i class="fas fa-calendar-week"></i> Eng faol kunlar</h3>
                            <div id="activeDays"></div>
                        </div>
                    </div>
                    
                    <!-- Device Stats -->
                    <div style="background: #1a1a1a; border-radius: 16px; padding: 20px;">
                        <h3 style="margin-bottom: 15px;"><i class="fas fa-mobile-alt"></i> Qurilma statistikasi</h3>
                        <div id="deviceStats" style="display: flex; gap: 20px; flex-wrap: wrap;"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('closeAnalyticsModal').onclick = () => modal.style.display = 'none';
        
        // Period filters
        document.querySelectorAll('.period-filter-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.period-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentPeriod = btn.dataset.period;
                loadAnalyticsData();
                updateGrowthChart();
            };
        });
        
        return modal;
    }
    
    // ===== LOAD ANALYTICS DATA =====
    function loadAnalyticsData() {
        const userPosts = window.appState.posts.filter(p => p.userId === window.appState.currentUser.id);
        
        // Calculate totals
        const totalViews = userPosts.reduce((sum, p) => sum + (p.views || 0), 0);
        const totalLikes = userPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
        const totalFollowers = window.appState.followers[window.appState.currentUser.id]?.length || 0;
        const totalCoins = window.appState.currentUser.coins;
        
        document.getElementById('totalViews').textContent = totalViews.toLocaleString();
        document.getElementById('totalLikes').textContent = totalLikes.toLocaleString();
        document.getElementById('totalFollowers').textContent = totalFollowers.toLocaleString();
        document.getElementById('totalCoins').textContent = totalCoins.toLocaleString();
        
        // Calculate growth (simulated)
        document.getElementById('viewsGrowth').textContent = `+${Math.floor(Math.random() * 30) + 5}%`;
        document.getElementById('likesGrowth').textContent = `+${Math.floor(Math.random() * 25) + 3}%`;
        document.getElementById('followersGrowth').textContent = `+${Math.floor(Math.random() * 15) + 2}%`;
        document.getElementById('coinsGrowth').textContent = `+${Math.floor(Math.random() * 20) + 1}%`;
        
        // Best videos
        const bestVideos = [...userPosts].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5);
        const bestVideosDiv = document.getElementById('bestVideos');
        bestVideosDiv.innerHTML = bestVideos.map((video, index) => `
            <div class="best-video-item" data-post-id="${video.id}" style="display: flex; align-items: center; gap: 15px; padding: 12px; background: #0a0a0a; border-radius: 12px; cursor: pointer;">
                                <div style="width: 40px; text-align: center; font-weight: bold; color: ${index === 0 ? '#ffd700' : '#888'};">
                    ${index === 0 ? '🏆' : index + 1}
                </div>
                <video src="${video.mediaUrl}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;"></video>
                <div style="flex: 1;">
                    <div style="font-weight: 600;">${window.escapeHtml(video.caption || 'Videosiz')}</div>
                    <div style="font-size: 11px; color: #888;">❤️ ${video.likes || 0} | 👁️ ${video.views || 0}</div>
                </div>
                <div style="text-align: right;">
                    <div style="color: #ff0000; font-weight: bold;">${((video.likes || 0) / Math.max(1, totalLikes) * 100).toFixed(1)}%</div>
                </div>
            </div>
        `).join('');
        
        document.querySelectorAll('.best-video-item').forEach(el => {
            el.onclick = () => {
                const postId = el.dataset.postId;
                const video = window.appState.posts.find(p => p.id === postId);
                if (video) {
                    window.renderCustomFeed([video]);
                    document.getElementById('analyticsModal').style.display = 'none';
                }
            };
        });
        
        // Active hours
        const activeHoursDiv = document.getElementById('activeHours');
        const hours = [0, 6, 12, 18, 24];
        const hourLabels = ['Tun', 'Ertalab', 'Tush', 'Kech', 'Kechasi'];
        activeHoursDiv.innerHTML = hours.map((hour, i) => {
            const percent = Math.floor(Math.random() * 80) + 20;
            return `
                <div style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>${hourLabels[i]}</span>
                        <span>${percent}%</span>
                    </div>
                    <div style="height: 6px; background: #333; border-radius: 3px; overflow: hidden;">
                        <div style="width: ${percent}%; height: 100%; background: #ff0000; border-radius: 3px;"></div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Active days
        const activeDaysDiv = document.getElementById('activeDays');
        const days = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];
        activeDaysDiv.innerHTML = days.map(day => {
            const percent = Math.floor(Math.random() * 70) + 30;
            return `
                <div style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>${day}</span>
                        <span>${percent}%</span>
                    </div>
                    <div style="height: 6px; background: #333; border-radius: 3px; overflow: hidden;">
                        <div style="width: ${percent}%; height: 100%; background: #ff0000; border-radius: 3px;"></div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Device stats
        const deviceStatsDiv = document.getElementById('deviceStats');
        const devices = [
            { name: '📱 Mobil', percent: 65, icon: 'fa-mobile-alt' },
            { name: '💻 Kompyuter', percent: 25, icon: 'fa-desktop' },
            { name: '📟 Planshet', percent: 10, icon: 'fa-tablet-alt' }
        ];
        deviceStatsDiv.innerHTML = devices.map(device => `
            <div style="flex: 1; text-align: center;">
                <i class="fas ${device.icon}" style="font-size: 32px; color: #ff0000;"></i>
                <div style="font-size: 20px; font-weight: bold; margin: 5px 0;">${device.percent}%</div>
                <div style="font-size: 12px; color: #888;">${device.name}</div>
            </div>
        `).join('');
    }
    
    // ===== UPDATE GROWTH CHART =====
    function updateGrowthChart() {
        const canvas = document.getElementById('growthChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.parentElement.clientWidth - 40;
        const height = 250;
        canvas.width = width;
        canvas.height = height;
        
        ctx.clearRect(0, 0, width, height);
        
        // Generate data based on period
        let dataPoints = [];
        let labels = [];
        
        if (currentPeriod === 'week') {
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
                const views = Math.floor(Math.random() * 500) + 100;
                dataPoints.push(views);
            }
        } else if (currentPeriod === 'month') {
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                if (i % 5 === 0) {
                    labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
                }
                const views = Math.floor(Math.random() * 800) + 200;
                dataPoints.push(views);
            }
        } else {
            for (let i = 11; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                labels.push(date.toLocaleString('default', { month: 'short' }));
                const views = Math.floor(Math.random() * 3000) + 500;
                dataPoints.push(views);
            }
        }
        
        const maxValue = Math.max(...dataPoints, 1);
        const stepX = width / (dataPoints.length - 1);
        
        // Draw grid
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= 4; i++) {
            const y = (i / 4) * height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Draw gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        ctx.beginPath();
        dataPoints.forEach((value, index) => {
            const x = index * stepX;
            const y = height - (value / maxValue) * height;
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw line
        ctx.beginPath();
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        dataPoints.forEach((value, index) => {
            const x = index * stepX;
            const y = height - (value / maxValue) * height;
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        
        // Draw points
        dataPoints.forEach((value, index) => {
            const x = index * stepX;
            const y = height - (value / maxValue) * height;
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw labels
        ctx.fillStyle = '#888';
        ctx.font = '10px Arial';
        const step = Math.max(1, Math.floor(dataPoints.length / 7));
        for (let i = 0; i < dataPoints.length; i += step) {
            const x = i * stepX;
            if (labels[i]) {
                ctx.fillText(labels[i], x - 15, height - 5);
            }
        }
    }
    
    // ===== SIDEBARGA ANALYTICS TUGMASI =====
    function addAnalyticsButton() {
        const sidebarFooter = document.querySelector('.sidebar-footer');
        if (sidebarFooter && !document.querySelector('.analytics-btn')) {
            const analyticsBtn = document.createElement('button');
            analyticsBtn.className = 'premium-btn analytics-btn';
            analyticsBtn.style.marginTop = '10px';
            analyticsBtn.style.background = '#333';
            analyticsBtn.innerHTML = '<i class="fas fa-chart-line"></i> Statistika';
            analyticsBtn.onclick = () => window.showAnalytics();
            sidebarFooter.appendChild(analyticsBtn);
        }
    }
    
    function init() {
        addAnalyticsButton();
        window.log("Analytics.js loaded");
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    window.log("Analytics.js loaded");
})();
