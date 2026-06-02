// ============================================
// NOVA - VIDEO.JS (Video yuklash va o'chirish)
// ============================================

(function() {
    "use strict";
    
    // ===== UPLOAD VIDEO =====
    window.uploadVideo = function(file, title, desc, privacy) {
        if (!file) {
            window.showToast("❌ Fayl tanlanmadi!");
            return;
        }
        
        if (!title) title = "Videosiz";
        
        // Progress bar ko'rsatish
        const progressDiv = document.getElementById('uploadProgress');
        const progressBar = document.getElementById('uploadProgressBar');
        if (progressDiv) progressDiv.style.display = 'block';
        
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progressBar) progressBar.style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    const newPost = {
                        id: 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                        userId: window.appState.currentUser.id,
                        userName: window.appState.currentUser.name,
                        userAvatar: window.appState.currentUser.avatar,
                        caption: title,
                        description: desc,
                        mediaUrl: e.target.result,
                        mediaType: 'video',
                        likes: 0,
                        comments: [],
                        shares: 0,
                        views: 0,
                        time: 'hoziroq',
                        liked: false,
                        privacy: privacy || 'public',
                        createdAt: new Date().toISOString()
                    };
                    
                    window.appState.posts.unshift(newPost);
                    
                    // Update users
                    window.appState.users[window.appState.currentUser.id] = {
                        id: window.appState.currentUser.id,
                        name: window.appState.currentUser.name,
                        avatar: window.appState.currentUser.avatar,
                        bio: window.appState.currentUser.bio
                    };
                    
                    window.saveData();
                    window.renderFeed();
                    window.updateUI();
                    window.updateHashtags();
                    
                    if (progressDiv) progressDiv.style.display = 'none';
                    if (progressBar) progressBar.style.width = '0%';
                    
                    window.showToast("✅ Video joylandi! " + title);
                    
                    // Close modal
                    const modal = document.getElementById('uploadModal');
                    if (modal) modal.style.display = 'none';
                    
                    // Clear inputs
                    const videoInput = document.getElementById('videoFile');
                    const titleInput = document.getElementById('videoTitle');
                    const descInput = document.getElementById('videoDesc');
                    if (videoInput) videoInput.value = '';
                    if (titleInput) titleInput.value = '';
                    if (descInput) descInput.value = '';
                };
                reader.readAsDataURL(file);
            }
        }, 200);
    };
    
    // ===== DELETE VIDEO =====
    window.deleteVideo = function(postId) {
        if (confirm("Videoni o'chirmoqchimisiz?")) {
            window.appState.posts = window.appState.posts.filter(p => p.id !== postId);
            window.saveData();
            window.renderFeed();
            window.updateUI();
            window.showToast("🗑️ Video o'chirildi!");
            
            // Close reels if open
            const reelsContainer = document.getElementById('reelsContainer');
            if (reelsContainer && reelsContainer.style.display === 'block') {
                reelsContainer.style.display = 'none';
            }
        }
    };
    
    // ===== SETUP UPLOAD MODAL =====
    function setupUploadModal() {
        const uploadBtn = document.getElementById('uploadBtn');
        const uploadModal = document.getElementById('uploadModal');
        const closeUploadModal = document.getElementById('closeUploadModal');
        const uploadArea = document.getElementById('uploadArea');
        const videoFile = document.getElementById('videoFile');
        const publishBtn = document.getElementById('publishBtn');
        
        if (uploadBtn) {
            uploadBtn.onclick = () => {
                if (uploadModal) uploadModal.style.display = 'flex';
            };
        }
        
        if (closeUploadModal) {
            closeUploadModal.onclick = () => {
                if (uploadModal) uploadModal.style.display = 'none';
            };
        }
        
        if (uploadArea) {
            uploadArea.onclick = () => {
                if (videoFile) videoFile.click();
            };
        }
        
        if (videoFile) {
            videoFile.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const title = document.getElementById('videoTitle')?.value || '';
                    const desc = document.getElementById('videoDesc')?.value || '';
                    const privacy = document.getElementById('videoPrivacy')?.value || 'public';
                    window.uploadVideo(file, title, desc, privacy);
                }
            };
        }
        
        if (publishBtn) {
            publishBtn.onclick = () => {
                const file = document.getElementById('videoFile')?.files[0];
                if (file) {
                    const title = document.getElementById('videoTitle')?.value || '';
                    const desc = document.getElementById('videoDesc')?.value || '';
                    const privacy = document.getElementById('videoPrivacy')?.value || 'public';
                    window.uploadVideo(file, title, desc, privacy);
                } else {
                    window.showToast("❌ Videoni tanlang!");
                }
            };
        }
    }
    
    // ===== SETUP PROFILE MODAL =====
    function setupProfileModal() {
        const editProfileBtn = document.getElementById('editProfileBtn');
        const profileModal = document.getElementById('profileModal');
        const closeProfileModal = document.getElementById('closeProfileModal');
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        const profileImage = document.getElementById('profileImage');
        const editName = document.getElementById('editName');
        const editBio = document.getElementById('editBio');
        const profilePreview = document.getElementById('profilePreview');
        
        if (editProfileBtn) {
            editProfileBtn.onclick = () => {
                if (editName) editName.value = window.appState.currentUser.name;
                if (editBio) editBio.value = window.appState.currentUser.bio;
                if (profilePreview) profilePreview.src = window.appState.currentUser.avatar;
                if (profileModal) profileModal.style.display = 'flex';
            };
        }
        
        if (closeProfileModal) {
            closeProfileModal.onclick = () => {
                if (profileModal) profileModal.style.display = 'none';
            };
        }
        
        if (profileImage) {
            profileImage.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        if (profilePreview) profilePreview.src = ev.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            };
        }
        
        if (saveProfileBtn) {
            saveProfileBtn.onclick = () => {
                const name = editName ? editName.value : window.appState.currentUser.name;
                const bio = editBio ? editBio.value : window.appState.currentUser.bio;
                const file = profileImage ? profileImage.files[0] : null;
                window.saveProfile(name, bio, file);
                if (profileModal) profileModal.style.display = 'none';
            };
        }
    }
    
    // ===== SAVE PROFILE =====
    window.saveProfile = function(name, bio, avatarFile) {
        if (name) window.appState.currentUser.name = name;
        if (bio) window.appState.currentUser.bio = bio;
        
        if (avatarFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                window.appState.currentUser.avatar = e.target.result;
                window.updateUI();
                window.saveData();
                window.showToast("✅ Profil yangilandi!");
            };
            reader.readAsDataURL(avatarFile);
        } else {
            window.updateUI();
            window.saveData();
            window.showToast("✅ Profil yangilandi!");
        }
    };
    
    // ===== INIT =====
    function init() {
        setupUploadModal();
        setupProfileModal();
        window.log("Video.js loaded");
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
