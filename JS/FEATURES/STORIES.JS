// ============================================
// NOVA - STORIES.JS (Instagram style stories)
// ============================================

(function() {
    "use strict";
    
    let currentStoryUser = null;
    let currentStoryIndex = 0;
    let storyInterval = null;
    let storyProgress = 0;
    
    // ===== SHOW STORIES =====
    window.showStories = function(userId) {
        const userStories = getStoriesByUser(userId);
        if (!userStories || userStories.length === 0) return;
        
        currentStoryUser = userId;
        currentStoryIndex = 0;
        
        createStoriesModal();
        loadStory(currentStoryIndex);
        
        document.getElementById('storiesModal').style.display = 'flex';
    };
    
    // ===== GET STORIES (demo data) =====
    function getStoriesByUser(userId) {
        // Stories localStorage dan olinadi
        const savedStories = localStorage.getItem('nova_stories');
        const allStories = savedStories ? JSON.parse(savedStories) : [];
        return allStories.filter(s => s.userId === userId && new Date(s.expiresAt) > new Date());
    }
    
    // ===== CREATE STORIES MODAL =====
    function createStoriesModal() {
        if (document.getElementById('storiesModal')) return;
        
        const modal = document.createElement('div');
        modal.id = 'storiesModal';
        modal.className = 'stories-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 7000;
            display: none;
            align-items: center;
            justify-content: center;
        `;
        modal.innerHTML = `
            <div style="position: relative; width: 100%; max-width: 450px; height: 100%; max-height: 800px; margin: auto;">
                <div id="storyProgressContainer" style="position: absolute; top: 10px; left: 10px; right: 10px; display: flex; gap: 4px; z-index: 20;"></div>
                <div id="storyContent" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;"></div>
                <div style="position: absolute; top: 0; left: 0; width: 20%; height: 100%; z-index: 15; cursor: pointer;" id="prevStoryBtn"></div>
                <div style="position: absolute; top: 0; right: 0; width: 20%; height: 100%; z-index: 15; cursor: pointer;" id="nextStoryBtn"></div>
                <button id="closeStoriesBtn" style="position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.5); border: none; color: white; font-size: 24px; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; z-index: 20;">
                    <i class="fas fa-times"></i>
                </button>
                <div style="position: absolute; bottom: 80px; left: 20px; right: 80px; z-index: 20;">
                    <input type="text" id="storyReplyInput" placeholder="Javob yozing..." style="width: 100%; background: rgba(0,0,0,0.6); border: none; border-radius: 30px; padding: 12px 20px; color: #fff;">
                </div>
                <div class="story-reactions" style="position: absolute; bottom: 80px; right: 20px; z-index: 20;">
                    <button id="sendHeartReaction" style="background: none; border: none; font-size: 30px; cursor: pointer;">❤️</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('closeStoriesBtn').onclick = () => {
            modal.style.display = 'none';
            if (storyInterval) clearInterval(storyInterval);
        };
        
        document.getElementById('prevStoryBtn').onclick = () => prevStory();
        document.getElementById('nextStoryBtn').onclick = () => nextStory();
        document.getElementById('sendHeartReaction').onclick = () => sendStoryReaction('❤️');
        
        document.getElementById('storyReplyInput').onkeypress = (e) => {
            if (e.key === 'Enter') sendStoryReply();
        };
    }
    
    // ===== LOAD STORY =====
    function loadStory(index) {
        const stories = getStoriesByUser(currentStoryUser);
        const story = stories[index];
        if (!story) return;
        
        // Update progress bars
        const progressContainer = document.getElementById('storyProgressContainer');
        progressContainer.innerHTML = stories.map((s, i) => `
            <div style="flex: 1; height: 3px; background: rgba(255,255,255,0.3); border-radius: 3px; overflow: hidden;">
                <div id="progress_${i}" style="width: ${i < index ? '100%' : i === index ? '0%' : '0%'}; height: 100%; background: white; transition: width 0.1s linear;"></div>
            </div>
        `).join('');
        
        // Load content
        const contentDiv = document.getElementById('storyContent');
        if (story.mediaType === 'video') {
            contentDiv.innerHTML = `
                <video id="storyVideo" src="${story.mediaUrl}" autoplay style="width: 100%; height: 100%; object-fit: contain;"></video>
                <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${story.userAvatar}" style="width: 35px; height: 35px; border-radius: 50%;">
                        <div><strong>${window.escapeHtml(story.userName)}</strong><br><span style="font-size: 11px;">${story.caption || ''}</span></div>
                    </div>
                </div>
            `;
            const video = document.getElementById('storyVideo');
            if (video) {
                video.onended = () => nextStory();
                video.ontimeupdate = () => {
                    const progress = (video.currentTime / video.duration) * 100;
                    const progressBar = document.getElementById(`progress_${index}`);
                    if (progressBar) progressBar.style.width = `${progress}%`;
                };
            }
        } else {
            contentDiv.innerHTML = `
                <img src="${story.mediaUrl}" style="width: 100%; height: 100%; object-fit: contain;">
                <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${story.userAvatar}" style="width: 35px; height: 35px; border-radius: 50%;">
                        <div><strong>${window.escapeHtml(story.userName)}</strong><br><span style="font-size: 11px;">${story.caption || ''}</span></div>
                    </div>
                </div>
            `;
            
            // Auto progress for images
            if (storyInterval) clearInterval(storyInterval);
            let progress = 0;
            storyInterval = setInterval(() => {
                progress += 2;
                const progressBar = document.getElementById(`progress_${index}`);
                if (progressBar) progressBar.style.width = `${progress}%`;
                if (progress >= 100) {
                    clearInterval(storyInterval);
                    nextStory();
                }
            }, 100);
        }
    }
    
    function nextStory() {
        const stories = getStoriesByUser(currentStoryUser);
        if (currentStoryIndex + 1 < stories.length) {
            currentStoryIndex++;
            loadStory(currentStoryIndex);
        } else {
            document.getElementById('storiesModal').style.display = 'none';
            if (storyInterval) clearInterval(storyInterval);
        }
    }
    
    function prevStory() {
        if (currentStoryIndex > 0) {
            currentStoryIndex--;
            loadStory(currentStoryIndex);
        }
    }
    
    function sendStoryReaction(emoji) {
        window.showToast(`${emoji} yuborildi!`);
        // Floating emoji animation
        const floatingEmoji = document.createElement('div');
        floatingEmoji.textContent = emoji;
        floatingEmoji.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            font-size: 60px;
            animation: fadeOutUp 1s forwards;
            pointer-events: none;
            z-index: 7001;
        `;
        document.body.appendChild(floatingEmoji);
        setTimeout(() => floatingEmoji.remove(), 1000);
    }
    
    function sendStoryReply() {
        const input = document.getElementById('storyReplyInput');
        if (input.value.trim()) {
            window.showToast(`💬 Javob yuborildi: ${input.value}`);
            input.value = '';
        }
    }
    
    window.log("Stories.js loaded");
})();
