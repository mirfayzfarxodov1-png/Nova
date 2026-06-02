// ============================================
// NOVA - SOUND-LIBRARY.JS (Musiqa kutubxonasi)
// ============================================

(function() {
    "use strict";
    
    const MUSIC_LIBRARY = [
        { id: 1, name: 'Summer Vibes', artist: 'Nova Music', duration: '2:30', genre: 'Pop', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
        { id: 2, name: 'Deep House', artist: 'Nova Music', duration: '3:15', genre: 'Electronic', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
        { id: 3, name: 'Acoustic Guitar', artist: 'Nova Music', duration: '2:45', genre: 'Acoustic', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
        { id: 4, name: 'Rock Anthem', artist: 'Nova Music', duration: '3:30', genre: 'Rock', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
        { id: 5, name: 'Jazz Lounge', artist: 'Nova Music', duration: '3:00', genre: 'Jazz', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
        { id: 6, name: 'Epic Orchestral', artist: 'Nova Music', duration: '4:00', genre: 'Classical', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
        { id: 7, name: 'Lo-Fi Beats', artist: 'Nova Music', duration: '2:20', genre: 'Lo-fi', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
        { id: 8, name: 'EDM Drop', artist: 'Nova Music', duration: '3:45', genre: 'EDM', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' }
    ];
    
    let currentAudio = null;
    let isPlaying = false;
    
    window.openSoundLibrary = function() {
        let modal = document.getElementById('soundLibraryModal');
        if (!modal) {
            modal = createSoundLibraryModal();
        }
        
        renderMusicList();
        modal.style.display = 'flex';
    };
    
    function createSoundLibraryModal() {
        const modal = document.createElement('div');
        modal.id = 'soundLibraryModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h3><i class="fas fa-music"></i> Musiqa kutubxonasi</h3>
                    <button class="close-modal" id="closeSoundModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 15px;">
                        <input type="text" id="searchMusic" placeholder="Qidirish..." class="form-input">
                    </div>
                    <div style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;">
                        <button class="genre-filter active" data-genre="all">Hammasi</button>
                        <button class="genre-filter" data-genre="Pop">Pop</button>
                        <button class="genre-filter" data-genre="Electronic">Electronic</button>
                        <button class="genre-filter" data-genre="Acoustic">Acoustic</button>
                        <button class="genre-filter" data-genre="Rock">Rock</button>
                        <button class="genre-filter" data-genre="Jazz">Jazz</button>
                        <button class="genre-filter" data-genre="Classical">Classical</button>
                        <button class="genre-filter" data-genre="Lo-fi">Lo-fi</button>
                        <button class="genre-filter" data-genre="EDM">EDM</button>
                    </div>
                    <div id="musicList" style="max-height: 400px; overflow-y: auto;"></div>
                    <div id="audioPlayer" style="display: none; margin-top: 15px; padding: 15px; background: #1a1a1a; border-radius: 12px;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <button id="playPauseMusicBtn" class="btn-small">▶️</button>
                            <div style="flex: 1;">
                                <div id="currentMusicName" style="font-weight: 600;"></div>
                                <div id="currentMusicArtist" style="font-size: 11px; color: #888;"></div>
                            </div>
                            <button id="addToVideoBtn" class="btn btn-primary" style="padding: 6px 12px;">➕ Videoga qo'shish</button>
                        </div>
                        <audio id="musicPlayer" style="width: 100%; margin-top: 10px;"></audio>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('closeSoundModal').onclick = () => modal.style.display = 'none';
        document.getElementById('searchMusic').oninput = (e) => renderMusicList(e.target.value);
        document.querySelectorAll('.genre-filter').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.genre-filter').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderMusicList(null, btn.dataset.genre);
            };
        });
        
        document.getElementById('playPauseMusicBtn').onclick = () => toggleMusic();
        document.getElementById('addToVideoBtn').onclick = () => addMusicToVideo();
        
        return modal;
    }
    
    function renderMusicList(search = '', genre = 'all') {
        const container = document.getElementById('musicList');
        let filtered = [...MUSIC_LIBRARY];
        
        if (search) {
            filtered = filtered.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.artist.toLowerCase().includes(search.toLowerCase()));
        }
        if (genre !== 'all') {
            filtered = filtered.filter(m => m.genre === genre);
        }
        
        container.innerHTML = filtered.map(music => `
            <div class="music-item" data-id="${music.id}" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border-bottom: 1px solid #1a1a1a; cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 15px;">
                                    <i class="fas fa-music" style="color: #ff0000;"></i>
                    <div>
                        <div style="font-weight: 600;">${window.escapeHtml(music.name)}</div>
                        <div style="font-size: 11px; color: #888;">${window.escapeHtml(music.artist)} • ${music.duration}</div>
                    </div>
                </div>
                <button class="play-music-btn" data-url="${music.url}" data-name="${music.name}" data-artist="${music.artist}" style="background: none; border: none; color: #ff0000; cursor: pointer;">▶️ Eshitish</button>
            </div>
        `).join('');
        
        document.querySelectorAll('.play-music-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const url = btn.dataset.url;
                const name = btn.dataset.name;
                const artist = btn.dataset.artist;
                playMusic(url, name, artist);
            };
        });
        
        document.querySelectorAll('.music-item').forEach(item => {
            item.onclick = () => {
                const id = parseInt(item.dataset.id);
                const music = MUSIC_LIBRARY.find(m => m.id === id);
                if (music) {
                    playMusic(music.url, music.name, music.artist);
                }
            };
        });
    }
    
    function playMusic(url, name, artist) {
        if (currentAudio) {
            currentAudio.pause();
        }
        
        const player = document.getElementById('musicPlayer');
        player.src = url;
        player.play();
        
        document.getElementById('currentMusicName').textContent = name;
        document.getElementById('currentMusicArtist').textContent = artist;
        document.getElementById('audioPlayer').style.display = 'block';
        
        currentAudio = player;
        isPlaying = true;
        document.getElementById('playPauseMusicBtn').innerHTML = '⏸️';
        
        player.onended = () => {
            isPlaying = false;
            document.getElementById('playPauseMusicBtn').innerHTML = '▶️';
        };
    }
    
    function toggleMusic() {
        if (currentAudio) {
            if (isPlaying) {
                currentAudio.pause();
                document.getElementById('playPauseMusicBtn').innerHTML = '▶️';
            } else {
                currentAudio.play();
                document.getElementById('playPauseMusicBtn').innerHTML = '⏸️';
            }
            isPlaying = !isPlaying;
        }
    }
    
    function addMusicToVideo() {
        window.showToast("🎵 Musiqa videoga qo'shildi!");
        document.getElementById('soundLibraryModal').style.display = 'none';
        window.openVideoEditor();
    }
    
    window.log("Sound-Library.js loaded");
})();
