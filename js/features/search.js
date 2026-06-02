// ============================================
// NOVA - SEARCH.JS (Kengaytirilgan qidiruv)
// ============================================

(function() {
    "use strict";
    
    let searchResults = [];
    let searchFilters = {
        type: 'all', // all, video, user
        sort: 'relevance', // relevance, latest, popular
        date: 'all' // all, today, week, month
    };
    
    // ===== SEARCH FUNCTION =====
    window.search = function(query, filters = {}) {
        if (!query || query.trim() === '') {
            window.renderFeed();
            return [];
        }
        
        searchFilters = { ...searchFilters, ...filters };
        query = query.toLowerCase();
        
        // Search in posts
        let results = [];
        
        // Videos
        const videoResults = window.appState.posts.filter(post => 
            post.caption.toLowerCase().includes(query) ||
            post.userName.toLowerCase().includes(query) ||
            post.description?.toLowerCase().includes(query)
        ).map(post => ({ ...post, searchType: 'video' }));
        
        // Users
        const userResults = Object.values(window.appState.users).filter(user =>
            user.name.toLowerCase().includes(query)
        ).map(user => ({ ...user, searchType: 'user' }));
        
        results = [...videoResults, ...userResults];
        
        // Apply filters
        if (searchFilters.type === 'video') {
            results = results.filter(r => r.searchType === 'video');
        } else if (searchFilters.type === 'user') {
            results = results.filter(r => r.searchType === 'user');
        }
        
        if (searchFilters.sort === 'latest') {
            results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (searchFilters.sort === 'popular') {
            results.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        }
        
        searchResults = results;
        renderSearchResults(results, query);
        
        return results;
    };
    
    // ===== RENDER SEARCH RESULTS =====
    function renderSearchResults(results, query) {
        const container = document.getElementById('feedContainer');
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="empty-search" style="text-align: center; padding: 60px 20px; color: #888;">
                    <i class="fas fa-search" style="font-size: 64px; margin-bottom: 20px; color: #ff0000;"></i>
                    <p style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">Hech narsa topilmadi</p>
                    <p style="font-size: 14px;">"${window.escapeHtml(query)}" bo'yicha hech qanday natija topilmadi</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="search-header" style="padding: 15px; border-bottom: 1px solid #1a1a1a; margin-bottom: 15px;">
                <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                    <button class="search-filter-btn ${searchFilters.type === 'all' ? 'active' : ''}" data-filter="all">
                        <i class="fas fa-globe"></i> Hammasi
                    </button>
                    <button class="search-filter-btn ${searchFilters.type === 'video' ? 'active' : ''}" data-filter="video">
                        <i class="fas fa-video"></i> Videolar
                    </button>
                    <button class="search-filter-btn ${searchFilters.type === 'user' ? 'active' : ''}" data-filter="user">
                        <i class="fas fa-users"></i> Foydalanuvchilar
                    </button>
                </div>
                <div style="display: flex; gap: 10px;">
                    <select id="searchSortSelect" style="background: #1a1a1a; border: 1px solid #ff0000; border-radius: 8px; padding: 5px 10px; color: #fff;">
                        <option value="relevance">Eng mos</option>
                        <option value="latest">Eng yangi</option>
                        <option value="popular">Eng mashhur</option>
                    </select>
                </div>
            </div>
            <div class="search-results-count" style="padding: 0 15px 15px; color: #888; font-size: 13px;">
                ${results.length} ta natija topildi
            </div>
        `;
        
        // Render results
        results.forEach(result => {
            if (result.searchType === 'video') {
                container.innerHTML += window.renderPostHTML(result);
            } else if (result.searchType === 'user') {
                container.innerHTML += `
                    <div class="search-user-result" style="display: flex; align-items: center; justify-content: space-between; padding: 15px; background: #0a0a0a; border-radius: 16px; margin-bottom: 10px; cursor: pointer;" onclick="window.goToChannel('${result.id}')">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <img src="${result.avatar}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
                            <div>
                                <div style="font-weight: 600;">${window.escapeHtml(result.name)}</div>
                                <div style="font-size: 12px; color: #888;">${window.appState.followers[result.id]?.length || 0} obunachi</div>
                            </div>
                        </div>
                        <button class="follow-btn" onclick="event.stopPropagation(); window.toggleSubscribe('${result.id}')">
                            ${window.appState.subscriptions.includes(result.id) ? 'Obunada' : 'Obuna'}
                        </button>
                    </div>
                `;
            }
        });
        
        // Setup filter buttons
        document.querySelectorAll('.search-filter-btn').forEach(btn => {
            btn.onclick = () => {
                const filter = btn.dataset.filter;
                window.search(query, { type: filter });
            };
        });
        
        // Setup sort select
        const sortSelect = document.getElementById('searchSortSelect');
        if (sortSelect) {
            sortSelect.onchange = () => {
                window.search(query, { sort: sortSelect.value });
            };
        }
        
        window.attachPostEvents();
    }
    
    // ===== SEARCH HASHTAG =====
    window.searchHashtag = function(hashtag) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = hashtag;
            window.search(hashtag);
        }
    };
    
    // ===== GET TRENDING HASHTAGS =====
    window.getTrendingHashtags = function() {
        const hashtagCount = {};
        
        window.appState.posts.forEach(post => {
            const hashtags = post.caption?.match(/#[\w\u0400-\u04FF]+/g) || [];
            hashtags.forEach(tag => {
                const lowerTag = tag.toLowerCase();
                hashtagCount[lowerTag] = (hashtagCount[lowerTag] || 0) + 1;
            });
        });
        
        return Object.entries(hashtagCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([tag]) => tag);
    };
    
    // ===== UPDATE TRENDING HASHTAGS DISPLAY =====
    window.updateTrendingHashtags = function() {
        const container = document.getElementById('hashtagList');
        if (!container) return;
        
        const trending = window.getTrendingHashtags();
        
        if (trending.length === 0) {
            container.innerHTML = `
                <span class="hashtag" onclick="window.searchHashtag('#Nova')">#Nova</span>
                <span class="hashtag" onclick="window.searchHashtag('#MirfayzCreator')">#MirfayzCreator</span>
            `;
            return;
        }
        
        container.innerHTML = trending.map(tag => `
            <span class="hashtag" onclick="window.searchHashtag('${tag}')">${tag}</span>
        `).join('');
    };
    
    // ===== SETUP SEARCH INPUT =====
    window.setupSearch = function() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const debouncedSearch = window.debounce((e) => {
                const query = e.target.value;
                if (query && query.trim()) {
                    window.search(query);
                } else {
                    window.renderFeed();
                }
            }, 500);
            searchInput.addEventListener('input', debouncedSearch);
            
            // Clear button
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    searchInput.value = '';
                    window.renderFeed();
                }
            });
        }
    };
    
    window.log("Search.js loaded");
})();
