// ============================================
// NOVA - FEED.JS (Feed va postlar)
// ============================================

(function() {
    "use strict";
    
    // ===== RENDER POST HTML =====
    function renderPostHTML(post) {
        const isSubscribed = window.appState.subscriptions.includes(post.userId);
        const commentsCount = post.comments?.length || 0;
        
        return `
            <div class="post" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-user" onclick="window.goToChannel('${post.userId}')">
                        <img src="${post.userAvatar}" class="post-avatar" onerror="this.src='https://ui-avatars.com/api/?background=FF0000&color=fff&name=User'">
                        <div class="post-info">
                            <h4>
                                ${window.escapeHtml(post.userName)}
                                <button class="follow-btn" style="margin-left:8px; padding:2px 8px; font-size:10px" 
                                        onclick="event.stopPropagation(); window.toggleSubscribe('${post.userId}')">
                                    ${isSubscribed ? 'Obunada' : 'Obuna'}
                                </button>
                                <button class="channel-btn" onclick="event.stopPropagation(); window.goToChannel('${post.userId}')">
                                    <i class="fas fa-bell"></i> Kanal
                                </button>
                            </h4>
                            <div class="post-time">${post.time}</div>
                        </div>
                    </div>
                    <div class="post-menu" onclick="event.stopPropagation(); window.toggleMenu(this)">
                        <i class="fas fa-ellipsis-h"></i>
                        <div class="post-menu-dropdown">
                            ${post.userId === window.appState.currentUser.id ? 
                                `<div onclick="window.deleteVideo('${post.id}')"><i class="fas fa-trash"></i> O'chirish</div>` : 
                                `<div onclick="window.reportPost()"><i class="fas fa-flag"></i> Shikoyat qilish</div>`
                            }
                            <div onclick="window.sharePost('${post.id}')"><i class="fas fa-share"></i> Ulashish</div>
                            <div onclick="window.copyLink('${post.id}')"><i class="fas fa-link"></i> Havolani nusxalash</div>
                        </div>
                    </div>
                </div>
                
                <video src="${post.mediaUrl}" class="post-video" controls preload="metadata"></video>
                
                <div class="post-actions">
                    <button class="action-btn ${post.liked ? 'liked' : ''}" onclick="window.toggleLike('${post.id}')">
                        <i class="fas fa-heart"></i> <span>${window.formatNumber(post.likes || 0)}</span>
                    </button>
                    <button class="action-btn" onclick="window.showComments('${post.id}')">
                        <i class="fas fa-comment"></i> <span>${commentsCount}</span>
                    </button>
                    <button class="action-btn" onclick="window.sharePost('${post.id}')">
                        <i class="fas fa-share"></i> <span>${post.shares || 0}</span>
                    </button>
                    <button class="action-btn ${isSubscribed ? 'liked' : ''}" onclick="window.toggleSubscribe('${post.userId}')">
                        <i class="fas fa-bell"></i> <span>${isSubscribed ? 'Obunada' : 'Obuna'}</span>
                    </button>
                </div>
                
                <div class="post-caption">
                    <strong>${window.escapeHtml(post.userName)}</strong> ${window.escapeHtml(post.caption)}
                    ${post.description ? `<br><span style="color: #888; font-size: 12px;">${window.escapeHtml(post.description)}</span>` : ''}
                </div>
                
                <div class="post-comments" onclick="window.showComments('${post.id}')">
                    ${commentsCount > 0 ? `Barcha ${commentsCount} ta kommentni ko'rish` : 'Komment yozing'}
                </div>
                
                <div class="comment-input">
                    <input type="text" id="comment_input_${post.id}" placeholder="Komment yozing...">
                    <button onclick="window.addComment('${post.id}', document.getElementById('comment_input_${post.id}').value)">Yuborish</button>
                </div>
            </div>
        `;
    }
    
    // ===== RENDER FEED =====
    window.renderFeed = function() {
        const container = document.getElementById('feedContainer');
        if (!container) return;
        
        // Privacy filter
        const visiblePosts = window.appState.posts.filter(post => {
            if (post.privacy === 'public') return true;
            if (post.privacy === 'subscribers' && window.appState.subscriptions.includes(post.userId)) return true;
            if (post.privacy === 'private' && post.userId === window.appState.currentUser.id) return true;
            if (post.userId === window.appState.currentUser.id) return true;
            return false;
        });
        
        if (visiblePosts.length === 0) {
            container.innerHTML = `
                <div class="empty-feed">
                    <i class="fas fa-video"></i>
                    <p>Hech qanday video yo'q.</p>
                    <p style="font-size: 12px;">Birinchi videoni yuklang!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = visiblePosts.map(post => renderPostHTML(post)).join('');
    };
    
    // ===== RENDER CUSTOM FEED =====
    window.renderCustomFeed = function(postsArray) {
        const container = document.getElementById('feedContainer');
        if (container) {
            if (postsArray.length === 0) {
                container.innerHTML = `
                    <div class="empty-feed">
                        <i class="fas fa-video"></i>
                        <p>Hech qanday video yo'q.</p>
                    </div>
                `;
                return;
            }
            container.innerHTML = postsArray.map(post => renderPostHTML(post)).join('');
        }
    };
    
    // ===== SHOW MY VIDEOS =====
    window.showMyVideos = function() {
        const myVideos = window.appState.posts.filter(p => p.userId === window.appState.currentUser.id);
        window.renderCustomFeed(myVideos);
        window.showToast("📹 Sizning videolaringiz");
    };
    
    // ===== SHOW FOLLOWERS =====
    window.showFollowers = function() {
        const followers = window.appState.followers[window.appState.currentUser.id] || [];
        if (followers.length === 0) {
            window.showToast("Hozircha obunachilar yo'q");
            return;
        }
        const followersList = followers.map(id => window.appState.users[id]?.name || 'Noma\'lum').join('\n');
        alert(`Obunachilar (${followers.length}):\n${followersList}`);
    };
    
    // ===== SHOW EXPLORE =====
    window.showExplore = function() {
        const randomPosts = [...window.appState.posts].sort(() => Math.random() - 0.5).slice(0, 30);
        if (randomPosts.length === 0) {
            window.showToast("🔍 Hozircha videolar yo'q");
            return;
        }
        window.renderCustomFeed(randomPosts);
        window.showToast("🔍 Kashf et - eng qiziqarli videolar");
    };
    
    // ===== SHOW TRENDING =====
    window.showTrending = function() {
        const trendingPosts = [...window.appState.posts]
            .sort((a, b) => (b.likes || 0) - (a.likes || 0))
            .slice(0, 20);
        if (trendingPosts.length === 0) {
            window.showToast("📈 Hozircha trenddagi videolar yo'q");
            return;
        }
        window.renderCustomFeed(trendingPosts);
        window.showToast("📈 Trenddagi eng mashhur videolar");
    };
    
    // ===== SEARCH =====
    window.setupSearch = function() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const debouncedSearch = window.debounce(function(e) {
                const query = e.target.value.toLowerCase();
                if (!query) {
                    window.renderFeed();
                    return;
                }
                const filtered = window.appState.posts.filter(p => 
                    p.userName.toLowerCase().includes(query) || 
                    p.caption.toLowerCase().includes(query)
                );
                window.renderCustomFeed(filtered);
            }, 300);
            searchInput.addEventListener('input', debouncedSearch);
        }
    };
    
    // ===== REPORT POST =====
    window.reportPost = function() {
        window.showToast("📢 Shikoyatingiz qabul qilindi!");
    };
    
    // ===== COPY LINK =====
    window.copyLink = function(postId) {
        navigator.clipboard.writeText(window.location.href + '?post=' + postId);
        window.showToast("🔗 Havola nusxalandi!");
    };
    
    // ===== SHARE POST =====
    window.sharePost = function(postId) {
        const post = window.appState.posts.find(p => p.id === postId);
        if (post) {
            navigator.clipboard.writeText(window.location.href + '?post=' + postId);
            window.showToast("🔗 Havola nusxalandi!");
            post.shares = (post.shares || 0) + 1;
            window.saveData();
            window.renderFeed();
            if (document.getElementById('reelsContainer').style.display === 'block') {
                window.showReels();
            }
        }
    };
    
    // ===== TOGGLE MENU =====
    window.toggleMenu = function(menuElement) {
        const dropdown = menuElement.querySelector('.post-menu-dropdown');
        if (dropdown) dropdown.classList.toggle('show');
        
        // Close other dropdowns
        document.querySelectorAll('.post-menu-dropdown.show').forEach(d => {
            if (d !== dropdown) d.classList.remove('show');
        });
    };
    
    // ===== CLOSE DROPDOWNS =====
    document.addEventListener('click', () => {
        document.querySelectorAll('.post-menu-dropdown.show').forEach(d => d.classList.remove('show'));
    });
    
    window.log("Feed.js loaded");
})();
