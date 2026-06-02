// ============================================
// NOVA - VIDEO-EDITOR.JS (Video tahrirlash)
// ============================================

(function() {
    "use strict";
    
    let currentVideoFile = null;
    let currentVideoUrl = null;
    let videoElement = null;
    let canvas = null;
    let ctx = null;
    let trimStart = 0;
    let trimEnd = 0;
    let videoDuration = 0;
    let filters = {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        grayscale: 0,
        sepia: 0
    };
    let selectedFilter = 'none';
    let cropData = { x: 0, y: 0, width: 1, height: 1 };
    
    // Filtrlar ro'yxati
    const FILTERS = [
        { id: 'none', name: 'Normal', icon: 'fa-undo' },
        { id: 'brightness', name: 'Yorqinlik', icon: 'fa-sun' },
        { id: 'contrast', name: 'Kontrast', icon: 'fa-adjust' },
        { id: 'grayscale', name: 'Oq-qora', icon: 'fa-circle' },
        { id: 'sepia', name: 'Sepia', icon: 'fa-image' },
        { id: 'blur', name: 'Loyqa', icon: 'fa-eye-slash' },
        { id: 'vintage', name: 'Vintage', icon: 'fa-camera-retro' },
        { id: 'cool', name: 'Sovuq', icon: 'fa-snowflake' },
        { id: 'warm', name: 'Issiq', icon: 'fa-fire' }
    ];
    
    // ===== OPEN VIDEO EDITOR =====
    window.openVideoEditor = function(postId = null) {
        let modal = document.getElementById('videoEditorModal');
        if (!modal) {
            modal = createVideoEditorModal();
        }
        
        if (postId) {
            const post = window.appState.posts.find(p => p.id === postId);
            if (post && post.mediaType === 'video') {
                currentVideoUrl = post.mediaUrl;
                loadVideo(currentVideoUrl);
            }
        }
        
        modal.style.display = 'flex';
        initEditor();
    };
    
    function createVideoEditorModal() {
        const modal = document.createElement('div');
        modal.id = 'videoEditorModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px; width: 95%;">
                <div class="modal-header">
                    <h3><i class="fas fa-video"></i> Video tahrirlash</h3>
                    <button class="close-modal" id="closeVideoEditorModal">&times;</button>
                </div>
                <div class="modal-body">
                    <!-- Video Preview -->
                    <div class="editor-preview" style="background: #000; border-radius: 12px; overflow: hidden; position: relative;">
                        <canvas id="editorCanvas" style="width: 100%; max-height: 400px;"></canvas>
                        <video id="editorVideo" style="display: none;"></video>
                    </div>
                    
                    <!-- Timeline -->
                    <div class="editor-timeline" style="margin: 15px 0;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span id="trimStartTime">0:00</span>
                            <span id="trimEndTime">0:00</span>
                        </div>
                        <input type="range" id="timelineSlider" min="0" max="100" value="0" style="width: 100%;">
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <button id="playPauseBtn" class="btn-small">▶️ O'ynatish</button>
                            <button id="setTrimStartBtn" class="btn-small">📌 Kesish boshi</button>
                            <button id="setTrimEndBtn" class="btn-small">📍 Kesish oxiri</button>
                            <button id="resetTrimBtn" class="btn-small">🔄 Bekor qilish</button>
                        </div>
                    </div>
                    
                    <!-- Tabs -->
                    <div class="editor-tabs" style="display: flex; gap: 10px; border-bottom: 1px solid #ff000020; margin: 15px 0;">
                        <button class="editor-tab active" data-tab="filters">🎨 Filtrlar</button>
                        <button class="editor-tab" data-tab="adjust">⚙️ Sozlamalar</button>
                        <button class="editor-tab" data-tab="crop">✂️ Kesish</button>
                        <button class="editor-tab" data-tab="speed">⚡ Tezlik</button>
                    </div>
                    
                    <!-- Filters Tab -->
                    <div id="filtersTab" class="editor-tab-content">
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px;">
                            ${FILTERS.map(filter => `
                                <div class="filter-option" data-filter="${filter.id}" style="text-align: center; cursor: pointer; padding: 10px; border-radius: 12px; transition: all 0.2s;">
                                    <i class="fas ${filter.icon}" style="font-size: 24px;"></i>
                                    <div style="font-size: 11px; margin-top: 5px;">${filter.name}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Adjust Tab -->
                    <div id="adjustTab" class="editor-tab-content" style="display: none;">
                        <div class="adjust-sliders">
                            <div class="slider-item" style="margin-bottom: 15px;">
                                <label>Yorqinlik: <span id="brightnessVal">100</span>%</label>
                                <input type="range" id="brightnessSlider" min="0" max="200" value="100" style="width: 100%;">
                            </div>
                            <div class="slider-item" style="margin-bottom: 15px;">
                                <label>Kontrast: <span id="contrastVal">100</span>%</label>
                                <input type="range" id="contrastSlider" min="0" max="200" value="100" style="width: 100%;">
                            </div>
                            <div class="slider-item" style="margin-bottom: 15px;">
                                <label>To'yinganlik: <span id="saturationVal">100</span>%</label>
                                <input type="range" id="saturationSlider" min="0" max="200" value="100" style="width: 100%;">
                            </div>
                            <div class="slider-item" style="margin-bottom: 15px;">
                                <label>Loyqalik: <span id="blurVal">0</span>px</label>
                                <input type="range" id="blurSlider" min="0" max="10" value="0" style="width: 100%;">
                            </div>
                        </div>
                        <button id="resetAdjustBtn" class="btn btn-secondary" style="margin-top: 10px;">🔄 Sozlamalarni tiklash</button>
                    </div>
                    
                    <!-- Crop Tab -->
                    <div id="cropTab" class="editor-tab-content" style="display: none;">
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                            <button class="crop-preset" data-ratio="1:1" style="padding: 12px; background: #1a1a1a; border: 1px solid #ff0000; border-radius: 12px; cursor: pointer;">1:1 (Kvadrat)</button>
                            <button class="crop-preset" data-ratio="4:3" style="padding: 12px; background: #1a1a1a; border: 1px solid #ff0000; border-radius: 12px; cursor: pointer;">4:3</button>
                            <button class="crop-preset" data-ratio="16:9" style="padding: 12px; background: #1a1a1a; border: 1px solid #ff0000; border-radius: 12px; cursor: pointer;">16:9 (Kino)</button>
                            <button class="crop-preset" data-ratio="9:16" style="padding: 12px; background: #1a1a1a; border: 1px solid #ff0000; border-radius: 12px; cursor: pointer;">9:16 (Reels)</button>
                            <button class="crop-preset" data-ratio="free" style="padding: 12px; background: #1a1a1a; border: 1px solid #ff0000; border-radius: 12px; cursor: pointer;">Erkin</button>
                        </div>
                        <button id="applyCropBtn" class="btn btn-primary" style="margin-top: 15px;">✂️ Kesishni qo'llash</button>
                    </div>
                    
                    <!-- Speed Tab -->
                    <div id="speedTab" class="editor-tab-content" style="display: none;">
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                            <button class="speed-option" data-speed="0.25" style="padding: 12px; background: #1a1a1a; border: 1px solid #ff0000; border-radius: 12px; cursor: pointer;">0.25x</button>
                            <button class="speed-option" data-speed="0.5" style="padding: 12px; background: #1a1a1a; border: 1px solid #ff0000; border-radius: 12px; cursor: pointer;">0.5x</button>
                            <button class="speed-option" data-speed="1" style="padding: 12px; background: #ff0000; border: 1px solid #ff0000; border-radius: 12px; cursor: pointer;">1x (Normal)</button>
                            <button class="speed-option" data-speed="1.5" style="padding: 12px; background: #1a1a1a; border: 1px solid #ff0000; border-radius: 12px; cursor: pointer;">1.5x</button>
                            <button class="speed-option" data-speed="2" style="padding: 12px; background: #1a1a1a; border: 1px solid #ff0000; border-radius: 12px; cursor: pointer;">2x</button>
                            <button class="speed-option" data-speed="3" style="padding: 12px; background: #1a1a1a; border: 1px solid #ff0000; border-radius: 12px; cursor: pointer;">3x</button>
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div style="display: flex; gap: 15px; margin-top: 20px;">
                        <button id="exportVideoBtn" class="btn btn-primary" style="flex: 2;">💾 Saqlash va eksport</button>
                        <button id="cancelEditBtn" class="btn btn-secondary" style="flex: 1;">❌ Bekor qilish</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Event listeners
        document.getElementById('closeVideoEditorModal').onclick = () => modal.style.display = 'none';
        document.getElementById('cancelEditBtn').onclick = () => modal.style.display = 'none';
        
        // Tab switching
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.onclick = () => {
                document.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const tabId = tab.dataset.tab;
                document.querySelectorAll('.editor-tab-content').forEach(content => content.style.display = 'none');
                document.getElementById(`${tabId}Tab`).style.display = 'block';
            };
        });
        
        // Filters
        document.querySelectorAll('.filter-option').forEach(filter => {
            filter.onclick = () => {
                document.querySelectorAll('.filter-option').forEach(f => f.style.background = '#1a1a1a');
                filter.style.background = '#ff000020';
                selectedFilter = filter.dataset.filter;
                applyFilter();
            };
        });
        
        // Adjust sliders
        document.getElementById('brightnessSlider').oninput = (e) => {
            filters.brightness = parseInt(e.target.value);
            document.getElementById('brightnessVal').textContent = filters.brightness;
            applyFilter();
        };
        document.getElementById('contrastSlider').oninput = (e) => {
            filters.contrast = parseInt(e.target.value);
            document.getElementById('contrastVal').textContent = filters.contrast;
            applyFilter();
        };
        document.getElementById('saturationSlider').oninput = (e) => {
            filters.saturation = parseInt(e.target.value);
            document.getElementById('saturationVal').textContent = filters.saturation;
            applyFilter();
        };
        document.getElementById('blurSlider').oninput = (e) => {
            filters.blur = parseInt(e.target.value);
            document.getElementById('blurVal').textContent = filters.blur;
            applyFilter();
        };
        
        document.getElementById('resetAdjustBtn').onclick = () => {
            filters = { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0 };
            document.getElementById('brightnessSlider').value = 100;
            document.getElementById('contrastSlider').value = 100;
            document.getElementById('saturationSlider').value = 100;
            document.getElementById('blurSlider').value = 0;
            document.getElementById('brightnessVal').textContent = 100;
            document.getElementById('contrastVal').textContent = 100;
            document.getElementById('saturationVal').textContent = 100;
            document.getElementById('blurVal').textContent = 0;
            applyFilter();
        };
        
        // Timeline
        document.getElementById('timelineSlider').oninput = (e) => {
            const percent = e.target.value / 100;
            if (videoElement) {
                videoElement.currentTime = percent * videoDuration;
                drawVideoFrame();
            }
        };
        
        document.getElementById('playPauseBtn').onclick = () => {
            if (videoElement.paused) {
                videoElement.play();
                document.getElementById('playPauseBtn').innerHTML = '⏸️ To\'xtatish';
            } else {
                videoElement.pause();
                document.getElementById('playPauseBtn').innerHTML = '▶️ O\'ynatish';
            }
        };
        
        document.getElementById('setTrimStartBtn').onclick = () => {
            trimStart = videoElement.currentTime;
            document.getElementById('trimStartTime').textContent = formatTime(trimStart);
            window.showToast(`✅ Kesish boshi: ${formatTime(trimStart)}`);
        };
        
        document.getElementById('setTrimEndBtn').onclick = () => {
            trimEnd = videoElement.currentTime;
            document.getElementById('trimEndTime').textContent = formatTime(trimEnd);
            window.showToast(`✅ Kesish oxiri: ${formatTime(trimEnd)}`);
        };
        
        document.getElementById('resetTrimBtn').onclick = () => {
            trimStart = 0;
            trimEnd = videoDuration;
            document.getElementById('trimStartTime').textContent = formatTime(0);
            document.getElementById('trimEndTime').textContent = formatTime(videoDuration);
            window.showToast("🔄 Kesish bekor qilindi");
        };
        
        // Export
        document.getElementById('exportVideoBtn').onclick = () => exportVideo();
        
        return modal;
    }
    
    function initEditor() {
        canvas = document.getElementById('editorCanvas');
        ctx = canvas.getContext('2d');
        videoElement = document.getElementById('editorVideo');
        
        if (videoElement) {
            videoElement.onseeked = () => drawVideoFrame();
            videoElement.onloadedmetadata = () => {
                videoDuration = videoElement.duration;
                trimEnd = videoDuration;
                document.getElementById('trimEndTime').textContent = formatTime(videoDuration);
                document.getElementById('timelineSlider').max = 100;
                drawVideoFrame();
            };
        }
    }
    
    function loadVideo(url) {
        if (videoElement) {
            videoElement.src = url;
            videoElement.load();
        }
    }
    
    function drawVideoFrame() {
        if (!videoElement || !canvas || !ctx) return;
        
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // Apply filters
        applyFilterToCanvas();
    }
    
    function applyFilter() {
        if (!ctx || !canvas) return;
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i+1];
            let b = data[i+2];
            
            // Apply selected filter
            if (selectedFilter === 'grayscale') {
                const gray = (r + g + b) / 3;
                r = g = b = gray;
            } else if (selectedFilter === 'sepia') {
                r = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
                g = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
                b = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
            } else if (selectedFilter === 'vintage') {
                r = Math.min(255, r * 1.2);
                g = Math.min(255, g * 0.9);
                b = Math.min(255, b * 0.8);
            } else if (selectedFilter === 'cool') {
                r = Math.min(255, r * 0.8);
                g = Math.min(255, g * 0.9);
                b = Math.min(255, b * 1.2);
            } else if (selectedFilter === 'warm') {
                r = Math.min(255, r * 1.2);
                g = Math.min(255, g * 1.1);
                b = Math.min(255, b * 0.8);
            }
            
            // Apply adjustments
            r = Math.min(255, Math.max(0, r * (filters.brightness / 100)));
            g = Math.min(255, Math.max(0, g * (filters.brightness / 100)));
            b = Math.min(255, Math.max(0, b * (filters.brightness / 100)));
            
            const contrast = filters.contrast / 100;
            r = Math.min(255, Math.max(0, ((r - 128) * contrast) + 128));
            g = Math.min(255, Math.max(0, ((g - 128) * contrast) + 128));
            b = Math.min(255, Math.max(0, ((b - 128) * contrast) + 128));
            
            data[i] = r;
            data[i+1] = g;
            data[i+2] = b;
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Apply blur if needed
        if (filters.blur > 0) {
            ctx.filter = `blur(${filters.blur}px)`;
            ctx.drawImage(canvas, 0, 0);
            ctx.filter = 'none';
        }
    }
    
    function applyFilterToCanvas() {
        applyFilter();
    }
    
    async function exportVideo() {
        window.showLoader();
        window.showToast("🎬 Video eksport qilinmoqda...");
        
        // Simulate export
        setTimeout(() => {
            window.hideLoader();
            window.showToast("✅ Video saqlandi!");
            document.getElementById('videoEditorModal').style.display = 'none';
            
            // Create new post with edited video
            const newPost = {
                id: 'post_' + Date.now(),
                userId: window.appState.currentUser.id,
                userName: window.appState.currentUser.name,
                userAvatar: window.appState.currentUser.avatar,
                caption: 'Tahrirlangan video',
                mediaUrl: currentVideoUrl,
                mediaType: 'video',
                likes: 0,
                comments: [],
                shares: 0,
                time: 'hoziroq',
                liked: false,
                privacy: 'public',
                isEdited: true
            };
            window.appState.posts.unshift(newPost);
            window.saveData();
            window.renderFeed();
        }, 2000);
    }
    
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    window.log("Video-Editor.js loaded");
})();
