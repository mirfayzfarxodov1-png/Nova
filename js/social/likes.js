// ============================================
// NOVA - LIKES.JS (Layk tizimi)
// ============================================

(function() {
    "use strict";
    
    // ===== NOVA LIKE ANIMATION =====
    function showNovaLikeAnimation() {
        const anim = document.createElement('div');
        anim.className = 'nova-like';
        anim.innerHTML = 'NOVA ❤️';
        document.body.appendChild(anim);
        setTimeout(() => anim.remove(), 800);
    }
    
    // ===== ADD COINS ON LIKE =====
    function addCoinsOnLike() {
        window.appState.currentUser.coins += 1;
        window.saveData();
        window.updateUI();
    }
    
    // ===== TOGGLE LIKE =====
    window.toggleLike = function(postId) {
        const post = window.appState.posts.find(p => p.id === postId);
        if (!post) return;
        
        const wasLiked = post.liked;
        post.liked = !wasLiked;
        post.likes += wasLiked ? -1 : 1;
        
        if (!wasLiked) {
            showNovaLikeAnimation();
            addCoinsOnLike();
            window.showToast("+1 Nova Coin");
        }
        
        if (!wasLiked && post.userId !== window.appState.currentUser.id) {
            window.addNotification(
                post.userId,
                `${window.appState.currentUser.name} sizning videongizga layk bosdi!`,
                'like',
                post.id
            );
        }
        
        window.saveData();
        window.renderFeed();
        
        // Update reels if open
        if (document.getElementById('reelsContainer').style.display === 'block') {
            window.showReels();
        }
    };
    
    window.log("Likes.js loaded");
})();
