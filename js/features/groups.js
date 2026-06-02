// ============================================
// NOVA - GROUPS.JS (Guruhlar tizimi)
// Instagram guruhlari kabi to'liq funksiyali
// ============================================

(function() {
    "use strict";
    
    // ===== GURUHLAR MA'LUMOTLARI =====
    let groups = [];
    let currentGroup = null;
    
    // ===== GURUH YARATISH MODALI =====
    window.showCreateGroup = function() {
        let modal = document.getElementById('createGroupModal');
        if (!modal) {
            modal = createGroupModal();
        }
        modal.style.display = 'flex';
    };
    
    function createGroupModal() {
        const modal = document.createElement('div');
        modal.id = 'createGroupModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3><i class="fas fa-users"></i> Yangi guruh yaratish</h3>
                    <button class="close-modal" id="closeCreateGroupModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="upload-area" id="groupAvatarArea" style="padding: 20px; margin-bottom: 15px;">
                        <i class="fas fa-camera" style="font-size: 48px;"></i>
                        <p>Guruh rasmi yuklash</p>
                        <input type="file" id="groupAvatar" accept="image/*" hidden>
                    </div>
                    <input type="text" id="groupName" class="form-input" placeholder="Guruh nomi" maxlength="50">
                    <textarea id="groupDescription" class="form-input" placeholder="Guruh tavsifi" rows="3" maxlength="500"></textarea>
                    <select id="groupPrivacy" class="form-input">
                        <option value="public">Ochiq (hamma ko'ra oladi)</option>
                        <option value="private">Yopiq (faqat a'zolar)</option>
                        <option value="secret">Maxfiy (qidiruvda chiqmaydi)</option>
                    </select>
                    <div class="group-members" style="margin: 15px 0;">
                        <label>A'zolarni qo'shish</label>
                        <div id="selectedMembers" style="display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0;"></div>
                        <input type="text" id="searchMember" class="form-input" placeholder="Foydalanuvchi qidirish...">
                        <div id="membersList" style="max-height: 200px; overflow-y: auto; margin-top: 10px;"></div>
                    </div>
                    <button id="createGroupBtn" class="btn btn-primary">Guruh yaratish</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('closeCreateGroupModal').onclick = () => modal.style.display = 'none';
        
        // Group avatar upload
        const avatarArea = document.getElementById('groupAvatarArea');
        const avatarInput = document.getElementById('groupAvatar');
        avatarArea.onclick = () => avatarInput.click();
        avatarInput.onchange = (e) => {
            if (e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    avatarArea.innerHTML = `<img src="${ev.target.result}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">`;
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        };
        
        // Search members
        const searchInput = document.getElementById('searchMember');
        const membersList = document.getElementById('membersList');
        const selectedMembers = document.getElementById('selectedMembers');
        let selectedUsers = [];
        
        searchInput.oninput = (e) => {
            const query = e.target.value.toLowerCase();
            const users = Object.values(window.appState.users).filter(u => 
                u.id !== window.appState.currentUser.id && 
                u.name.toLowerCase().includes(query) &&
                !selectedUsers.includes(u.id)
            ).slice(0, 10);
            
            membersList.innerHTML = users.map(user => `
                <div class="member-item" data-id="${user.id}" style="display: flex; align-items: center; gap: 10px; padding: 10px; cursor: pointer; border-bottom: 1px solid #1a1a1a;">
                    <img src="${user.avatar}" style="width: 40px; height: 40px; border-radius: 50%;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600;">${window.escapeHtml(user.name)}</div>
                        <div style="font-size: 11px; color: #888;">${window.appState.followers[user.id]?.length || 0} obunachi</div>
                    </div>
                    <button class="add-member-btn" data-id="${user.id}" style="background: #ff0000; border: none; padding: 4px 12px; border-radius: 20px; cursor: pointer;">Qo'shish</button>
                </div>
            `).join('');
            
            document.querySelectorAll('.add-member-btn').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    const userId = btn.dataset.id;
                    if (!selectedUsers.includes(userId)) {
                        selectedUsers.push(userId);
                        updateSelectedMembers();
                        searchInput.value = '';
                        membersList.innerHTML = '';
                    }
                };
            });
        };
        
        function updateSelectedMembers() {
            selectedMembers.innerHTML = selectedUsers.map(id => {
                const user = window.appState.users[id];
                return `
                    <div class="selected-member" data-id="${id}" style="background: #ff000020; padding: 4px 12px; border-radius: 20px; display: flex; align-items: center; gap: 8px;">
                        <img src="${user.avatar}" style="width: 20px; height: 20px; border-radius: 50%;">
                        <span style="font-size: 12px;">${window.escapeHtml(user.name)}</span>
                        <button class="remove-member" data-id="${id}" style="background: none; border: none; color: #ff0000; cursor: pointer;">×</button>
                    </div>
                `;
            }).join('');
            
            document.querySelectorAll('.remove-member').forEach(btn => {
                btn.onclick = () => {
                    const userId = btn.dataset.id;
                    selectedUsers = selectedUsers.filter(id => id !== userId);
                    updateSelectedMembers();
                };
            });
        }
        
        document.getElementById('createGroupBtn').onclick = () => {
            const name = document.getElementById('groupName').value;
            const description = document.getElementById('groupDescription').value;
            const privacy = document.getElementById('groupPrivacy').value;
            const avatarFile = document.getElementById('groupAvatar').files[0];
            
            if (!name) {
                window.showToast("❌ Guruh nomini kiriting!");
                return;
            }
            
            createGroup(name, description, privacy, avatarFile, selectedUsers);
            modal.style.display = 'none';
        };
        
        return modal;
    }
    
    function createGroup(name, description, privacy, avatarFile, members) {
        const groupId = 'group_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        
        const newGroup = {
            id: groupId,
            name: name,
            description: description,
            privacy: privacy,
            avatar: null,
            owner: window.appState.currentUser.id,
            admins: [window.appState.currentUser.id],
            members: [window.appState.currentUser.id, ...members],
            posts: [],
            createdAt: new Date().toISOString(),
            rules: []
        };
        
        if (avatarFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                newGroup.avatar = e.target.result;
                saveGroup(newGroup);
            };
            reader.readAsDataURL(avatarFile);
        } else {
            saveGroup(newGroup);
        }
    }
    
    function saveGroup(group) {
        const savedGroups = JSON.parse(localStorage.getItem('nova_groups') || '[]');
        savedGroups.push(group);
        localStorage.setItem('nova_groups', JSON.stringify(savedGroups));
        window.showToast("✅ Guruh yaratildi!");
        showGroupsList();
    }
    
    // ===== GURUHLAR RO'YXATINI KO'RSATISH =====
    window.showGroupsList = function() {
        let modal = document.getElementById('groupsModal');
        if (!modal) {
            modal = createGroupsModal();
        }
        
        const groups = JSON.parse(localStorage.getItem('nova_groups') || '[]');
        const myGroups = groups.filter(g => g.members.includes(window.appState.currentUser.id));
        
        const container = document.getElementById('groupsList');
        if (myGroups.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #888;">
                    <i class="fas fa-users" style="font-size: 48px; margin-bottom: 15px;"></i>
                    <p>Siz hali hech qanday guruhga a'zo emassiz</p>
                    <button class="btn btn-primary" id="createGroupFromEmpty">Guruh yaratish</button>
                </div>
            `;
            document.getElementById('createGroupFromEmpty').onclick = () => window.showCreateGroup();
        } else {
            container.innerHTML = myGroups.map(group => `
                <div class="group-item" data-id="${group.id}" style="display: flex; align-items: center; gap: 15px; padding: 15px; border-bottom: 1px solid #1a1a1a; cursor: pointer;">
                    <div style="width: 50px; height: 50px; background: #ff0000; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                        ${group.avatar ? `<img src="${group.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i class="fas fa-users" style="font-size: 24px;"></i>`}
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600;">${window.escapeHtml(group.name)}</div>
                        <div style="font-size: 11px; color: #888;">${group.members.length} a'zo • ${group.privacy === 'public' ? 'Ochiq' : group.privacy === 'private' ? 'Yopiq' : 'Maxfiy'}</div>
                    </div>
                    <i class="fas fa-chevron-right" style="color: #888;"></i>
                </div>
            `).join('');
            
            document.querySelectorAll('.group-item').forEach(item => {
                item.onclick = () => {
                    const groupId = item.dataset.id;
                    openGroup(groupId);
                };
            });
        }
        
        modal.style.display = 'flex';
    };
    
    function createGroupsModal() {
        const modal = document.createElement('div');
        modal.id = 'groupsModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3><i class="fas fa-users"></i> Mening guruhlarim</h3>
                    <button class="close-modal" id="closeGroupsModal">&times;</button>
                </div>
                <div class="modal-body">
                    <button class="btn btn-primary" id="createGroupBtnModal" style="margin-bottom: 15px;">➕ Yangi guruh</button>
                    <div id="groupsList"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('closeGroupsModal').onclick = () => modal.style.display = 'none';
        document.getElementById('createGroupBtnModal').onclick = () => {
            modal.style.display = 'none';
            window.showCreateGroup();
        };
        
        return modal;
    }
    
    // ===== GURUH SAHIFASINI OCHISH =====
    function openGroup(groupId) {
        const groups = JSON.parse(localStorage.getItem('nova_groups') || '[]');
        const group = groups.find(g => g.id === groupId);
        if (!group) return;
        
        currentGroup = group;
        
        let modal = document.getElementById('groupPageModal');
        if (!modal) {
            modal = createGroupPageModal();
        }
        
        renderGroupPage(group);
        modal.style.display = 'flex';
    }
    
    function createGroupPageModal() {
        const modal = document.createElement('div');
        modal.id = 'groupPageModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px; max-height: 85vh;">
                <div class="modal-header">
                    <div id="groupHeader" style="display: flex; align-items: center; gap: 15px;">
                        <div id="groupAvatar" style="width: 50px; height: 50px; background: #ff0000; border-radius: 50%; display: flex; align-items: center; justify-content: center;"></div>
                        <div>
                            <h3 id="groupName"></h3>
                            <div id="groupStats" style="font-size: 11px; color: #888;"></div>
                        </div>
                    </div>
                    <button class="close-modal" id="closeGroupPageModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="group-tabs" style="display: flex; gap: 10px; border-bottom: 1px solid #ff000020; margin-bottom: 15px;">
                        <button class="group-tab active" data-tab="posts">📝 Postlar</button>
                        <button class="group-tab" data-tab="members">👥 A'zolar (0)</button>
                        <button class="group-tab" data-tab="about">ℹ️ Ma'lumot</button>
                    </div>
                    <div id="groupPosts" class="group-tab-content"></div>
                    <div id="groupMembers" class="group-tab-content" style="display: none;"></div>
                    <div id="groupAbout" class="group-tab-content" style="display: none;"></div>
                    <div id="groupPostInput" style="margin-top: 15px; display: flex; gap: 10px;">
                        <input type="text" id="newGroupPost" class="form-input" placeholder="Guruhga post yozish...">
                        <button id="postToGroupBtn" class="btn btn-primary">Yuborish</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('closeGroupPageModal').onclick = () => modal.style.display = 'none';
        
        // Tab switching
        document.querySelectorAll('.group-tab').forEach(tab => {
            tab.onclick = () => {
                document.querySelectorAll('.group-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const tabId = tab.dataset.tab;
                document.querySelectorAll('.group-tab-content').forEach(content => content.style.display = 'none');
                document.getElementById(`group${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`).style.display = 'block';
            };
        });
        
        document.getElementById('postToGroupBtn').onclick = () => {
            const input = document.getElementById('newGroupPost');
            if (input.value.trim()) {
                addGroupPost(input.value);
                input.value = '';
            }
        };
        
        return modal;
    }
    
    function renderGroupPage(group) {
        document.getElementById('groupName').textContent = group.name;
        document.getElementById('groupStats').textContent = `${group.members.length} a'zo • ${group.privacy === 'public' ? 'Ochiq guruh' : 'Yopiq guruh'}`;
        
        const avatarDiv = document.getElementById('groupAvatar');
        if (group.avatar) {
            avatarDiv.innerHTML = `<img src="${group.avatar}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            avatarDiv.innerHTML = `<i class="fas fa-users" style="font-size: 24px;"></i>`;
        }
        
        // Render posts
        const postsDiv = document.getElementById('groupPosts');
        const groupPosts = group.posts || [];
        if (groupPosts.length === 0) {
            postsDiv.innerHTML = '<div style="text-align: center; padding: 40px; color: #888;">Hozircha postlar yo\'q</div>';
        } else {
            postsDiv.innerHTML = groupPosts.map(post => `
                <div class="group-post" style="background: #1a1a1a; border-radius: 12px; padding: 15px; margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <img src="${post.userAvatar}" style="width: 35px; height: 35px; border-radius: 50%;">
                        <div>
                            <div style="font-weight: 600;">${window.escapeHtml(post.userName)}</div>
                            <div style="font-size: 10px; color: #888;">${post.time}</div>
                        </div>
                    </div>
                    <div style="margin-bottom: 10px;">${window.escapeHtml(post.text)}</div>
                    <div style="display: flex; gap: 15px;">
                        <button class="group-like-btn" data-id="${post.id}" style="background: none; border: none; color: ${post.liked ? '#ff0000' : '#888'}; cursor: pointer;">
                            ❤️ ${post.likes || 0}
                        </button>
                        <button class="group-comment-btn" style="background: none; border: none; color: #888; cursor: pointer;">
                            💬 ${post.comments?.length || 0}
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        // Render members
        const membersDiv = document.getElementById('groupMembers');
        const members = group.members.map(memberId => window.appState.users[memberId]).filter(m => m);
        document.querySelector('.group-tab[data-tab="members"]').innerHTML = `👥 A'zolar (${members.length})`;
        membersDiv.innerHTML = members.map(member => `
            <div class="group-member" style="display: flex; align-items: center; gap: 10px; padding: 10px; border-bottom: 1px solid #1a1a1a;">
                <img src="${member.avatar}" style="width: 40px; height: 40px; border-radius: 50%; cursor: pointer;" onclick="window.goToChannel('${member.id}')">
                <div style="flex: 1;">
                    <div style="font-weight: 600; cursor: pointer;" onclick="window.goToChannel('${member.id}')">${window.escapeHtml(member.name)}</div>
                    <div style="font-size: 11px; color: #888;">${group.admins?.includes(member.id) ? 'Admin' : 'A\'zo'}</div>
                </div>
                ${group.owner === window.appState.currentUser.id && member.id !== window.appState.currentUser.id ? 
                    `<button class="remove-member-btn" data-id="${member.id}" style="background: #ff0000; border: none; padding: 4px 12px; border-radius: 20px; cursor: pointer;">O'chirish</button>` : ''
                }
            </div>
        `).join('');
        
        // Render about
        const aboutDiv = document.getElementById('groupAbout');
        aboutDiv.innerHTML = `
            <div style="padding: 15px;">
                <p><strong>Tavsif:</strong> ${group.description || 'Tavsif mavjud emas'}</p>
                <p><strong>Yaratilgan:</strong> ${new Date(group.createdAt).toLocaleDateString()}</p>
                <p><strong>Maxfiylik:</strong> ${group.privacy === 'public' ? 'Ochiq' : group.privacy === 'private' ? 'Yopiq' : 'Maxfiy'}</p>
                <p><strong>Admin:</strong> ${window.appState.users[group.owner]?.name || 'Noma\'lum'}</p>
                ${group.owner === window.appState.currentUser.id ? `
                    <button id="editGroupBtn" class="btn btn-secondary" style="margin-top: 15px;">✏️ Guruhni tahrirlash</button>
                    <button id="deleteGroupBtn" class="btn btn-primary" style="margin-top: 10px; background: #ff0000;">🗑️ Guruhni o'chirish</button>
                ` : ''}
            </div>
        `;
        
        if (group.owner === window.appState.currentUser.id) {
            document.getElementById('editGroupBtn').onclick = () => editGroup(group.id);
            document.getElementById('deleteGroupBtn').onclick = () => deleteGroup(group.id);
        }
    }
    
    function addGroupPost(text) {
        if (!currentGroup) return;
        
        const newPost = {
            id: 'group_post_' + Date.now(),
            userId: window.appState.currentUser.id,
            userName: window.appState.currentUser.name,
            userAvatar: window.appState.currentUser.avatar,
            text: text,
            likes: 0,
            comments: [],
            time: 'hoziroq',
            liked: false
        };
        
        if (!currentGroup.posts) currentGroup.posts = [];
        currentGroup.posts.unshift(newPost);
        
        const groups = JSON.parse(localStorage.getItem('nova_groups') || '[]');
        const index = groups.findIndex(g => g.id === currentGroup.id);
        if (index !== -1) {
            groups[index] = currentGroup;
            localStorage.setItem('nova_groups', JSON.stringify(groups));
        }
        
        renderGroupPage(currentGroup);
        window.showToast("✅ Post yozildi!");
    }
    
    function editGroup(groupId) {
        window.showToast("✏️ Guruhni tahrirlash tez orada!");
    }
    
    function deleteGroup(groupId) {
        if (confirm("Guruhni o'chirmoqchimisiz?")) {
            const groups = JSON.parse(localStorage.getItem('nova_groups') || '[]');
            const newGroups = groups.filter(g => g.id !== groupId);
            localStorage.setItem('nova_groups', JSON.stringify(newGroups));
            document.getElementById('groupPageModal').style.display = 'none';
            window.showToast("✅ Guruh o'chirildi!");
            showGroupsList();
        }
    }
    
    // ===== SIDEBARGA GURUHLAR TUGMASINI QO'SHISH =====
    function addGroupsToSidebar() {
        const navMenu = document.querySelector('.sidebar-nav');
        if (navMenu && !document.querySelector('[data-page="groups"]')) {
            const groupsNav = document.createElement('div');
            groupsNav.className = 'nav-item';
            groupsNav.setAttribute('data-page', 'groups');
            groupsNav.innerHTML = '<i class="fas fa-users"></i><span>Guruhlar</span>';
            groupsNav.onclick = () => window.showGroupsList();
            
            const chatNav = document.querySelector('[data-page="chat"]');
            if (chatNav && chatNav.parentNode) {
                chatNav.parentNode.insertBefore(groupsNav, chatNav.nextSibling);
            } else {
                navMenu.appendChild(groupsNav);
            }
        }
    }
    
    // ===== LOAD SAVED GROUPS =====
    function loadGroups() {
        const saved = localStorage.getItem('nova_groups');
        if (saved) {
            groups = JSON.parse(saved);
        }
    }
    
    function init() {
        loadGroups();
        addGroupsToSidebar();
        window.log("Groups.js loaded");
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    window.log("Groups.js loaded");
})();
