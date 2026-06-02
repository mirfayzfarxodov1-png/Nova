// ============================================
// NOVA - COMMENTS.JS (Kommentlar tizimi)
// ============================================

(function() {
    "use strict";
    
    let currentCommentPostId = null;
    
    // ===== ADD COMMENT =====
    window.addComment = function(postId, text) {
        if (!text || !text.trim()) return;
        
        const post = window.appState.posts.find(p => p.id === postId);
        if (!post) return;
        
        if (!post.comments) post.comments = [];
        
        post.comments.push({
            id: Date.now(),
            userId: window.appState.currentUser.id,
            userName: window.appState.currentUser.name,
            userAvatar: window.appState.currentUser.avatar,
            text: text.trim(),
            time: new Date().toLocaleString()
        });
        
        if (post.userId !== window.appState.currentUser.id) {
            window.addNotification(
                post.userId,
                `${window.appState.currentUser.name} videongizga komment qoldirdi: "${text.slice(0, 50)}"`,
                'comment',
                post.id
            );
        }
        
        // Add coins
        window.appState.currentUser.coins += 2;
        window.saveData();
        window.updateUI();
        window.renderFeed();
        
        // Update comments modal if open
        if (document.getElementById('commentsModal').style.display === 'flex') {
            window.showComments(postId);
        }
    };
    
    // ===== SHOW COMMENTS =====
    window.showComments = function(postId) {
        const post = window.appState.posts.find(p => p.id === postId);
        if (!post) return;
        
        currentCommentPostId = postId;
        const listDiv = document.getElementById('commentsList');
        
        if (!post.comments || post.comments.length === 0) {
            listDiv.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">Hozircha kommentlar yo\'q</div>';
        } else {
            listDiv.innerHTML = post.comments.map(c => `
                <div class="comment-item">
                    <img src="${c.userAvatar}" class="comment-avatar" onerror="this.src='https://ui-avatars.com/api/?background=FF0000&color=fff&name=User'">
                    <div style="flex: 1;">
                        <div class="comment-name">${window.escapeHtml(c.userName)}</div>
                        <div class="comment-text">${window.escapeHtml(c.text)}</div>
                        <div class="comment-time">${c.time}</div>
                    </div>
                </div>
            `).join('');
        }
        
        document.getElementById('commentsModal').style.display = 'flex';
        
        // Setup send button
        const sendBtn = document.getElementById('sendCommentBtn');
        const newInput = document.getElementById('newComment');
        
        const handleSend = () => {
            if (newInput.value.trim()) {
                window.addComment(postId, newInput.value);
                newInput.value = '';
                window.showComments(postId);
            }
        };
        
        if (sendBtn) sendBtn.onclick = handleSend;
        if (newInput) newInput.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };
    };
    
    // ===== SETUP COMMENTS MODAL CLOSE =====
    function setupCommentsModal() {
        const closeModal = document.getElementById('closeCommentsModal');
        if (closeModal) {
            closeModal.onclick = () => {
                document.getElementById('commentsModal').style.display = 'none';
                currentCommentPostId = null;
            };
        }
    }
    
    function init() {
        setupCommentsModal();
        window.log("Comments.js loaded");
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
