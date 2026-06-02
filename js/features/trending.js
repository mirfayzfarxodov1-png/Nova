// ============================================
// NOVA - TRENDING.JS (Kengaytirilgan trendlar)
// Kunlik, haftalik, oylik trendlar va grafiklar
// ============================================

(function() {
    "use strict";
    
    let currentFilter = 'day'; // day, week, month, year
    let trendingData = {
        videos: [],
        hashtags: [],
        creators: [],
        stats: {}
    };
    
    // ===== TRENDING SAHIFASINI KO'RSATISH =====
    window.showTrendingPage = function() {
        let modal = document.getElementById('trendingPageModal');
        if (!modal) {
            modal = createTrendingModal();
        }
        
        loadTrendingData();
        renderTrendingPage();
        modal.style.display = 'flex';
    };
    
    function createTrendingModal() {
        const modal = document.createElement('div');
        modal.id = 'trendingPageModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1000px; width: 95%; max-height: 85vh;">
                <div class="modal-header">
                    <h2><i class="fas fa-fire" style="color: #ff0000;"></i> Trendlar</h2>
                    <button class="close-modal" id="closeTrendingModal">&times;</button>
                </div>
                <div class="modal-body">
                    <!-- Filter tabs -->
                    <div class="trending-filters" style="display: flex; gap: 10px; border-bottom: 1px solid #ff000020; margin-bottom: 20px; flex-wrap: wrap;">
                        <button class="trend-filter-btn active" data-filter="day">📅 Bugun</button>
                        <button class="trend-filter-btn" data-filter="week">📆 Hafta</button>
                        <button class="trend-filter-btn" data-filter="month">📅 Oy</button>
                        <button class="trend-filter-btn" data-filter="year">🗓️ Yil</button>
                    </div>
                    
                    <!-- Trending Stats -->
                    <div class="trending-stats" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px;">
                        <div class="stat-card" style="background: #1a1a1a; padding: 15px; border-radius: 16px; text-align: center;">
                            <div id="totalViews" style="font-size: 24px; font-weight: bold; color: #ff0000;">0</div>
                            <div style="font-size: 12px;">Jami ko'rishlar</div>
                        </div>
                        <div class="stat-card" style="background: #1a1a1a; padding: 15px; border-radius: 16px; text-align: center;">
                            <div id="totalLikes" style="font-size: 24px; font-weight: bold; color: #ff0000;">0</div>
                            <div style="font-size: 12px;">Jami layklar</div>
                        </div>
                        <div class="stat-card" style="background: #1a1a1a; padding: 15px; border-radius: 16px; text-align: center;">
                            <div id="totalPosts" style="font-size: 24px; font-weight: bold; color: #ff0000;">0</div>
                            <div style="font-size: 12px;">Yangi postlar</div>
                        </div>
                        <div class="stat-card" style="background: #1a1a1a; padding: 15px; border-radius: 16px; text-align: center;">
                            <div id="trendScore" style="font-size: 24px; font-weight: bold; color: #ff0000;">0</div>
                            <div style="font-size: 12px;">Trend ball</div>
                        </div>
                    </div>
                    
                    <!-- Trending Videos -->
                    <div style="margin-bottom: 30px;">
                        <h3 style="margin-bottom: 15px;"><i class="fas fa-video"></i> Trenddagi videolar</h3>
                        <div id="trendingVideos" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;"></div>
                    </div>
                    
                    <!-- Trending Hashtags -->
                    <div style="margin-bottom: 30px; background: #1a1a1a; padding: 20px; border-radius: 16px;">
                        <h3 style="margin-bottom: 15px;"><i class="fas fa-hashtag"></i> Trenddagi hashtaglar</h3>
                        <div id="trendingHashtags" style="display: flex; flex-wrap: wrap; gap: 12px;"></div>
                    </div>
                    
                    <!-- Top Creators -->
                    <div style="margin-bottom: 20px;">
                        <h3 style="margin-bottom: 15px;"><i class="fas fa-trophy"></i> Top creatorlar</h3>
                        <div id="topCreators" style="display: flex; flex-direction: column; gap: 10px;"></div>
                    </div>
                    
                    <!-- Trend Chart -->
                    <div style="background: #1a1a1a; padding: 20px; border-radius: 16px;">
                        <h3 style="margin-bottom: 15px;"><i class="fas fa-chart-line"></i> Trend grafigi</h3>
                        <canvas id="trendChart" style="width: 100%; height: 300px;"></canvas>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('closeTrendingModal').onclick = () => modal.style.display = 'none';
        
        // Filter buttons
        document.querySelectorAll('.trend-filter-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.trend-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                loadTrendingData();
                renderTrendingPage();
            };
        });
        
        return modal;
    }
    
    // ===== TRENDING MA'LUMOTLARINI HISOBLASH =====
    function loadTrendingData() {
        const now = new Date();
        let timeLimit;
        
        switch(currentFilter) {
            case 'day': timeLimit = new Date(now - 24 * 60 * 60 * 1000); break;
            case 'week': timeLimit = new Date(now - 7 * 24 * 60 * 60 * 1000); break;
            case 'month': timeLimit = new Date(now - 30 * 24 * 60 * 60 * 1000); break;
            case 'year': timeLimit = new Date(now - 365 * 24 * 60 * 60 * 1000); break;
            default: timeLimit = new Date(now - 24 * 60 * 60 * 1000);
        }
        
        // Filter posts by time
        const recentPosts = window.appState.posts.filter(post => {
            const postDate = new Date(post.createdAt || post.time);
            return postDate >= timeLimit;
        });
        
        // Calculate trending score for each post
        const postsWithScore = recentPosts.map(post => {
            const hours = Math.max(1, (now - new Date(post.createdAt || post.time)) / (1000 * 60 * 60));
            const score = (post.likes || 0) * 1 + 
                         (post.comments?.length || 0) * 2 + 
                         (post.shares || 0) * 3 + 
                         (post.views || 0) * 0.5;
            return { ...post, score: score / hours };
        });
        
        // Sort by score
        trendingData.videos = postsWithScore.sort((a, b) => b.score - a.score).slice(0, 20);
        
        // Calculate hashtags
        const hashtagCount = {};
        recentPosts.forEach(post => {
            const hashtags = post.caption?.match(/#[\w\u0400-\u04FF]+/g) || [];
            hashtags.forEach(tag => {
                const lowerTag = tag.toLowerCase();
                hashtagCount[lowerTag] = (hashtagCount[lowerTag] || 0) + 1;
            });
        });
        trendingData.hashtags = Object.entries(hashtagCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([tag, count]) => ({ tag, count }));
        
        // Calculate top creators
        const creatorStats = {};
        recentPosts.forEach(post => {
            if (!creatorStats[post.userId]) {
                creatorStats[post.userId] = {
                    userId: post.userId,
                    name: post.userName,
                    avatar: post.userAvatar,
                    totalLikes: 0,
                    totalViews: 0,
                    totalComments: 0,
                    postCount: 0,
                    score: 0
                };
            }
            creatorStats[post.userId].totalLikes += post.likes || 0;
            creatorStats[post.userId].totalViews += post.views || 0;
            creatorStats[post.userId].totalComments += post.comments?.length || 0;
            creatorStats[post.userId].postCount++;
            creatorStats[post.userId].score = (post.likes || 0) + (post.comments?.length || 0) * 2;
        });
        trendingData.creators = Object.values(creatorStats)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
        
        // Calculate stats
        trendingData.stats = {
            totalViews: recentPosts.reduce((sum, p) => sum + (p.views || 0), 0),
            totalLikes: recentPosts.reduce((sum, p) => sum + (p.likes || 0), 0),
            totalPosts: recentPosts.length,
            trendScore: Math.floor(postsWithScore.reduce((sum, p) => sum + p.score, 0) / Math.max(1, recentPosts.length))
        };
    }
    
    // ===== RENDER TRENDING PAGE =====
    function renderTrendingPage() {
        // Update stats
        document.getElementById('totalViews').textContent = trendingData.stats.totalViews.toLocaleString();
        document.getElementById('totalLikes').textContent = trendingData.stats.totalLikes.toLocaleString();
        document.getElementById('totalPosts').textContent = trendingData.stats.totalPosts;
        document.getElementById('trendScore').textContent = trendingData.stats.trendScore;
        
        // Render videos
        const videosContainer = document.getElementById('trendingVideos');
        if (trendingData.videos.length === 0) {
            videosContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #888;">Hozircha trenddagi videolar yo\'q</div>';
        } else {
            videosContainer.innerHTML = trendingData.videos.map((video, index) => `
                <div class="trending-video" data-post-id="${video.id}" style="background: #0a0a0a; border-radius: 16px; overflow: hidden; cursor: pointer; border: 1px solid #ff000020; transition: transform 0.3s;">
                    <div style="position: relative;">
                        <video src="${video.mediaUrl}" style="width: 100%; height: 180px; object-fit: cover;"></video>
                        <div style="position: absolute; top: 10px; left: 10px; background: #ff0000; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                            #${index + 1}
                        </div>
                        <div style="position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.7); padding: 4px 8px; border-radius: 20px; font-size: 11px;">
                            🔥 ${Math.floor(video.score)} ball
                        </div>
                    </div>
                    <div style="padding: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <img src="${video.userAvatar}" style="width: 30px; height: 30px; border-radius: 50%;">
                            <div style="font-size: 13px; font-weight: 600;">${window.escapeHtml(video.userName)}</div>
                        </div>
                        <div style="font-size: 13px; color: #ddd; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${window.escapeHtml(video.caption || 'Videosiz')}
                        </div>
                        <div style="display: flex; gap: 15px; font-size: 11px; color: #888; margin-top: 8px;">
                            <span><i class="fas fa-heart"></i> ${(video.likes || 0).toLocaleString()}</span>
                            <span><i class="fas fa-comment"></i> ${(video.comments?.length || 0).toLocaleString()}</span>
                            <span><i class="fas fa-eye"></i> ${(video.views || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        // Render hashtags
        const hashtagsContainer = document.getElementById('trendingHashtags');
        if (trendingData.hashtags.length === 0) {
            hashtagsContainer.innerHTML = '<div style="color: #888;">Hozircha trenddagi hashtaglar yo\'q</div>';
        } else {
            hashtagsContainer.innerHTML = trendingData.hashtags.map(h => `
                <div class="trending-hashtag" data-hashtag="${h.tag}" style="background: #1a1a1a; padding: 8px 16px; border-radius: 30px; cursor: pointer; border: 1px solid #ff0000; transition: all 0.3s;">
                    <span style="color: #ff0000; font-weight: bold;">${h.tag}</span>
                    <span style="margin-left: 8px; font-size: 11px; color: #888;">${h.count} post</span>
                </div>
            `).join('');
        }
        
        // Render creators
        const creatorsContainer = document.getElementById('topCreators');
        if (trendingData.creators.length === 0) {
            creatorsContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #888;">Hozircha top creatorlar yo\'q</div>';
        } else {
            creatorsContainer.innerHTML = trendingData.creators.map((creator, index) => `
                <div class="top-creator" data-user-id="${creator.userId}" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #0a0a0a; border-radius: 12px; cursor: pointer; border: 1px solid #ff000020;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 35px; text-align: center; font-weight: bold; color: ${index < 3 ? '#ffd700' : '#888'}; font-size: 18px;">
                            ${index + 1}
                            ${index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                        </div>
                        <img src="${creator.avatar}" style="width: 45px; height: 45px; border-radius: 50%;">
                        <div>
                            <div style="font-weight: 600;">${window.escapeHtml(creator.name)}</div>
                            <div style="font-size: 11px; color: #888;">📹 ${creator.postCount} video</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: #ff0000; font-weight: bold;">🔥 ${Math.floor(creator.score)}</div>
                        <div style="font-size: 11px; color: #888;">❤️ ${creator.totalLikes.toLocaleString()}</div>
                    </div>
                </div>
            `).join('');
        }
        
        // Draw chart
        drawTrendChart();
        
        // Add click handlers
        document.querySelectorAll('.trending-video').forEach(el => {
            el.onclick = () => {
                const postId = el.dataset.postId;
                const post = window.appState.posts.find(p => p.id === postId);
                if (post) {
                    window.closeAllModals();
                    window.renderCustomFeed([post]);
                    window.showToast("📹 Video ochildi");
                }
            };
        });
        
        document.querySelectorAll('.trending-hashtag').forEach(el => {
            el.onclick = () => {
                const hashtag = el.dataset.hashtag;
                window.searchHashtag(hashtag);
                document.getElementById('trendingPageModal').style.display = 'none';
            };
        });
        
        document.querySelectorAll('.top-creator').forEach(el => {
            el.onclick = () => {
                const userId = el.dataset.userId;
                window.goToChannel(userId);
                document.getElementById('trendingPageModal').style.display = 'none';
            };
        });
    }
    
    // ===== DRAW TREND CHART =====
    function drawTrendChart() {
        const canvas = document.getElementById('trendChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.parentElement.clientWidth - 40;
        const height = 250;
        canvas.width = width;
        canvas.height = height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Get last 7 days data
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayPosts = window.appState.posts.filter(post => {
                const postDate = new Date(post.createdAt || post.time);
                return postDate.toDateString() === date.toDateString();
            });
            const totalScore = dayPosts.reduce((sum, p) => sum + (p.likes || 0) + (p.comments?.length || 0) * 2, 0);
            last7Days.push(totalScore);
        }
        
        const maxValue = Math.max(...last7Days, 1);
        
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
        
        // Draw line
        const stepX = width / 6;
        ctx.beginPath();
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        
        last7Days.forEach((value, index) => {
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
        last7Days.forEach((value, index) => {
            const x = index * stepX;
            const y = height - (value / maxValue) * height;
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw labels
        ctx.fillStyle = '#888';
        ctx.font = '10px Arial';
        for (let i = 0; i <= 6; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            ctx.fillText(`${date.getDate()}/${date.getMonth() + 1}`, i * stepX - 15, height - 5);
        }
    }
    
    // ===== ADD TRENDING BUTTON TO SIDEBAR =====
    function addTrendingButton() {
        const navMenu = document.querySelector('.sidebar-nav');
        if (navMenu && !document.querySelector('[data-page="trending-page"]')) {
            const trendingNav = document.createElement('div');
            trendingNav.className = 'nav-item';
            trendingNav.setAttribute('data-page', 'trending-page');
            trendingNav.innerHTML = '<i class="fas fa-chart-line"></i><span>Trendlar</span>';
            trendingNav.onclick = () => window.showTrendingPage();
            
            const exploreNav = document.querySelector('[data-page="explore"]');
            if (exploreNav && exploreNav.parentNode) {
                exploreNav.parentNode.insertBefore(trendingNav, exploreNav.nextSibling);
            } else {
                navMenu.appendChild(trendingNav);
            }
        }
    }
    
    function init() {
        addTrendingButton();
        window.log("Trending.js loaded");
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    window.log("Trending.js loaded");
})();
