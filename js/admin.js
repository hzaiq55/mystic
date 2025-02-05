// Add these functions at the top
async function getUsers() {
    try {
        const response = await fetch('data/users.txt');
        const data = await response.text();
        return data ? JSON.parse(data) : [defaultAdmin];
    } catch (error) {
        console.error('Error reading users:', error);
        return [defaultAdmin];
    }
}

async function saveUsers(users) {
    try {
        const response = await fetch('api/saveUsers.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(users)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save users');
        }
        
        return true;
    } catch (error) {
        console.error('Error saving users:', error);
        return false;
    }
}

// Add at the beginning of the file
const adminOptimizations = {
    init() {
        this.optimizeRendering();
        this.cacheDOM();
        this.setupEventDelegation();
    },

    optimizeRendering() {
        this.renderQueue = new Set();
        this.frameRequest = null;

        this.processRenderQueue = () => {
            this.renderQueue.forEach(callback => callback());
            this.renderQueue.clear();
            this.frameRequest = null;
        };
    },

    scheduleRender(callback) {
        this.renderQueue.add(callback);
        if (!this.frameRequest) {
            this.frameRequest = requestAnimationFrame(() => this.processRenderQueue());
        }
    },

    cacheDOM() {
        this.containers = {
            artists: document.getElementById('admin-artists-list'),
            releases: document.getElementById('admin-releases-list'),
            careers: document.getElementById('admin-careers-list'),
            messages: document.getElementById('messages-container'),
            applications: document.getElementById('applications-container')
        };
    },

    setupEventDelegation() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.delete-btn')) {
                const id = e.target.dataset.id;
                const type = e.target.dataset.type;
                if (id && type) {
                    this.handleDelete(type, id);
                }
            }
        });
    }
};

// Initialize admin optimizations
document.addEventListener('DOMContentLoaded', () => {
    adminOptimizations.init();
});

// Admin State Management
const adminState = {
    messages: [],
    applications: []
};

// Hero Section Management
function updateHeroSection() {
    const heroText = document.getElementById('admin-hero-text').value;
    const buttonLink = document.getElementById('admin-hero-button-link').value;
    
    document.getElementById('hero-text').textContent = heroText;
    // Update button link logic here
    
    localStorage.setItem('heroText', heroText);
    localStorage.setItem('heroButtonLink', buttonLink);
    alert('Hero section updated successfully!');
}

// Artist Management
async function addArtist(event) {
    event.preventDefault();
    try {
        const existingArtists = await getData('artists') || [];
        
        // Create new artist
        const newArtist = {
            id: existingArtists.length + 1,
            name: event.target.name.value,
            genre: event.target.genre.value,
            image: event.target.image.value,
            details: event.target.details.value
        };
        
        console.log('Adding new artist:', newArtist); // Debug log
        
        // Add to existing artists
        existingArtists.push(newArtist);
        
        // Save updated artists
        await setData('artists', existingArtists);
        
        // Re-render the artists list
        await renderAdminArtists(existingArtists);
        
        // Show success message
        showNotification('Artist added successfully!');
        event.target.reset();
        
        // Reload admin data to update all views
        await loadAdminData();
    } catch (error) {
        console.error('Error adding artist:', error);
        showNotification('Error adding artist: ' + error.message, 'error');
    }
}

async function deleteArtist(artistId) {
    try {
        // Get current artists
        let artists = await getData('artists') || [];
        
        // Filter out the deleted artist
        artists = artists.filter(artist => artist.id !== artistId);
        
        // Save updated artists list
        await setData('artists', artists);
        
        // Re-render the admin artists list
        renderAdminArtists(artists);
        
        showNotification('Artist deleted successfully!');
    } catch (error) {
        console.error('Error deleting artist:', error);
        showNotification('Error deleting artist: ' + error.message, 'error');
    }
}

// Update Release Management
async function addRelease(event) {
    event.preventDefault();
    try {
        // Get existing releases
        const existingReleases = await getData('releases') || [];
        
        // Create new release
        const newRelease = {
            id: existingReleases.length + 1,
            name: event.target.name.value,
            genre: event.target.genre.value,
            link: event.target.link.value
        };
        
        // Add to existing releases
        existingReleases.push(newRelease);
        
        // Save updated releases
        await setData('releases', existingReleases);
        
        // Re-render the admin releases list
        renderAdminReleases(existingReleases);
        
        showNotification('Release added successfully!');
        event.target.reset();
    } catch (error) {
        console.error('Error adding release:', error);
        showNotification('Error adding release: ' + error.message, 'error');
    }
}

async function deleteRelease(releaseId) {
    try {
        // Get current releases
        let releases = await getData('releases') || [];
        
        // Filter out the deleted release
        releases = releases.filter(release => release.id !== releaseId);
        
        // Save updated releases list
        await setData('releases', releases);
        
        // Re-render the admin releases list
        renderAdminReleases(releases);
        
        showNotification('Release deleted successfully!');
    } catch (error) {
        console.error('Error deleting release:', error);
        showNotification('Error deleting release: ' + error.message, 'error');
    }
}

function renderAdminReleases(releases) {
    const container = document.getElementById('admin-releases-list');
    if (!container) return;

    container.innerHTML = releases.map(release => `
        <div class="admin-item">
            <span>${release.name} - ${release.genre}</span>
            <a href="${release.link}" target="_blank">View</a>
            <button onclick="deleteRelease(${release.id})">Delete</button>
        </div>
    `).join('');
}

// Career Management
async function addCareer(event) {
    event.preventDefault();
    try {
        // Get existing careers
        const existingCareers = await getData('careers') || [];
        
        // Create new career
        const newCareer = {
            id: existingCareers.length + 1,
            title: event.target.title.value,
            description: event.target.description.value
        };
        
        // Add to existing careers
        existingCareers.push(newCareer);
        
        // Save updated careers
        await setData('careers', existingCareers);
        
        // Re-render only the admin careers list
        renderAdminCareers(existingCareers);
        
        showNotification('Career added successfully!');
        event.target.reset();
    } catch (error) {
        console.error('Error adding career:', error);
        showNotification('Error adding career: ' + error.message, 'error');
    }
}

async function deleteCareer(careerId) {
    try {
        // Get current careers
        let careers = await getData('careers') || [];
        
        // Filter out the deleted career
        careers = careers.filter(career => career.id !== careerId);
        
        // Save updated careers list
        await setData('careers', careers);
        
        // Re-render the admin careers list
        renderAdminCareers(careers);
        
        showNotification('Career deleted successfully!');
    } catch (error) {
        console.error('Error deleting career:', error);
        showNotification('Error deleting career: ' + error.message, 'error');
    }
}

function renderAdminCareers(careers) {
    const container = document.getElementById('admin-careers-list');
    if (!container) return;
    
    container.innerHTML = careers.map(career => `
        <div class="admin-item">
            <span>${career.title}</span>
            <p>${career.description}</p>
            <button onclick="deleteCareer(${career.id})">Delete</button>
        </div>
    `).join('');
}

// Application Management
async function renderApplications() {
    try {
        const applications = await getData('applications') || [];
        const container = document.getElementById('applications-container');
        if (!container) return;

        container.innerHTML = applications.map(app => `
            <div class="admin-item">
                <h3>Position: ${app.position}</h3>
                <p>Applicant: ${app.name}</p>
                <p>Email: ${app.email}</p>
                <p>Description: ${app.description}</p>
                <p>Time: ${new Date(app.timestamp).toLocaleString()}</p>
                <button onclick="deleteApplication(${app.id})">Delete</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error rendering applications:', error);
    }
}

async function deleteApplication(appId) {
    try {
        // Get current applications
        let applications = await getData('applications') || [];
        
        // Filter out the deleted application
        applications = applications.filter(app => app.id !== appId);
        
        // Save updated applications list
        await setData('applications', applications);
        
        // Re-render the applications list
        await renderApplications();
        
        showNotification('Application deleted successfully!');
    } catch (error) {
        console.error('Error deleting application:', error);
        showNotification('Error deleting application: ' + error.message, 'error');
    }
}

// Update Message Management
async function renderMessages() {
    try {
        const messages = await getData('messages') || [];
        const container = document.getElementById('messages-container');
        if (!container) return;

        container.innerHTML = messages.map(msg => `
            <div class="admin-item message-item">
                <h3>From: ${msg.name}</h3>
                <p>Email: ${msg.email}</p>
                <p>Message: ${msg.message}</p>
                <p>Time: ${new Date(msg.timestamp).toLocaleString()}</p>
                <button onclick="deleteMessage(${msg.id})">Delete</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error rendering messages:', error);
    }
}

async function deleteMessage(msgId) {
    try {
        // Get current messages
        let messages = await getData('messages') || [];
        
        // Filter out the deleted message
        messages = messages.filter(msg => msg.id !== msgId);
        
        // Save updated messages list
        await setData('messages', messages);
        
        // Re-render only the messages section
        await renderMessages();
        
        showNotification('Message deleted successfully!');
    } catch (error) {
        console.error('Error deleting message:', error);
        showNotification('Error deleting message: ' + error.message, 'error');
    }
}

// Admin Interface Rendering
function renderAdminArtists(artists) {
    const container = document.getElementById('admin-artists-list');
    if (!container) {
        console.error('Artists list container not found');
        return;
    }

    console.log('Rendering artists:', artists); // Debug log

    container.innerHTML = artists.map(artist => `
        <div class="admin-item">
            <img src="${artist.image}" alt="${artist.name}" style="width: 50px; height: 50px;">
            <div class="admin-item-content">
                <span class="admin-item-title">${artist.name}</span>
                <span class="admin-item-subtitle">${artist.genre}</span>
            </div>
            <div class="admin-item-actions">
                <button onclick="deleteArtist(${artist.id})" class="delete-btn">Delete</button>
            </div>
        </div>
    `).join('');
}

// Initialize Admin Interface
async function initializeAdminInterface() {
    try {
        await loadAdminData();
        const artistsItem = document.querySelector('.sidebar-item[onclick="showSection(\'artists\')"]');
        if (artistsItem && !artistsItem.classList.contains('active')) {
            artistsItem.classList.add('active');
        }
    } catch (error) {
        console.error('Error initializing admin interface:', error);
    }
}

async function loadAdminData() {
    try {
        // Load all data needed for admin interface
        const artists = await getData('artists') || [];
        const releases = await getData('releases') || [];
        const careers = await getData('careers') || [];
        
        // Render each section
        renderAdminArtists(artists);
        renderAdminReleases(releases);
        renderAdminCareers(careers);
        await renderMessages(); // Call the new renderMessages function
        await renderApplications(); // Add this line
        
    } catch (error) {
        console.error('Error loading admin data:', error);
    }
}

// Add the missing renderAdminLists function
async function renderAdminLists() {
    try {
        const artists = await getData('artists') || [];
        const releases = await getData('releases') || [];
        const careers = await getData('careers') || [];
        const messages = await getData('messages') || [];

        renderAdminArtists(artists);
        renderAdminReleases(releases);
        renderAdminCareers(careers);
        await renderMessages();
    } catch (error) {
        console.error('Error rendering admin lists:', error);
    }
}

// admin.js
document.addEventListener('DOMContentLoaded', function() {
    // Get the hero form
    const heroForm = document.getElementById('heroForm');
    
    heroForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get values from form
        const heroText = document.getElementById('heroText').value;
        const heroButtonLink = document.getElementById('heroButtonLink').value;
        
        // Save to localStorage
        localStorage.setItem('heroText', heroText);
        localStorage.setItem('heroButtonLink', heroButtonLink);
        
        alert('Hero section updated successfully!');
    });
});

// Admin-specific functionality
async function initializeAdminInterface() {
    await loadAdminData();
    renderAdminLists();
}

// Add other admin rendering functions here...

// Initialize when the page loads
if (document.querySelector('.dashboard')) {
    document.addEventListener('DOMContentLoaded', initializeAdminInterface);
}

// Add this to your initialization code
document.addEventListener('DOMContentLoaded', function() {
    // Add data-title attributes to sidebar items for mobile tooltips
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        const text = item.querySelector('.sidebar-text').textContent;
        item.setAttribute('data-title', text);
    });
});

// Add this to your initialization code
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');
    let touchStartX = 0;
    let touchEndX = 0;

    // Touch events for mobile swipe
    sidebar.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    sidebar.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const swipeLength = Math.abs(touchEndX - touchStartX);
        if (swipeLength > 30) { // Minimum swipe distance
            if (touchEndX < touchStartX) {
                sidebar.style.width = '50px';
                content.style.marginLeft = '50px';
                content.style.width = 'calc(100% - 50px)';
            } else {
                sidebar.style.width = '180px';
                content.style.marginLeft = '180px';
                content.style.width = 'calc(100% - 180px)';
            }
        }
    }

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 768) {
                sidebar.style.width = '';
                content.style.marginLeft = '';
                content.style.width = '';
            }
        }, 250);
    });
});

// Add notification functions
function showNotification(message, type = 'success') {
    const banner = document.getElementById('notification-banner');
    const messageEl = document.getElementById('notification-message');
    
    if (!banner || !messageEl) {
        console.error('Notification elements not found');
        return;
    }

    // Reset any existing animations
    banner.classList.remove('show');
    void banner.offsetWidth; // Trigger reflow
    
    messageEl.textContent = message;
    banner.className = `notification-banner ${type}`;
    banner.classList.add('show');
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        banner.classList.remove('show');
    }, 3000);
}

function closeBanner() {
    const banner = document.getElementById('notification-banner');
    if (banner) {
        banner.classList.remove('show');
    }
}

// Update handleArtistSubmit and other similar functions to use showNotification
async function handleArtistSubmit(event) {
    event.preventDefault();
    try {
        // ...existing code...
        showNotification('Artist added successfully!');
        event.target.reset();
    } catch (error) {
        console.error('Error adding artist:', error);
        showNotification('Error adding artist: ' + error.message, 'error');
    }
}

// User Management Functions
async function addUser(event) {
    event.preventDefault();
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (currentUser?.role !== 'admin') {
        showNotification('Only admin can add users', 'error');
        return;
    }

    const users = await getData('users') || [{ username: 'admin', password: 'admin999', role: 'admin' }];
    const newUser = {
        username: event.target.username.value,
        password: event.target.password.value,
        role: 'user'
    };

    users.push(newUser);
    await setData('users', users);
    showNotification('User added successfully!');
    event.target.reset();
    await renderUsers();
}

async function renderUsers() {
    const container = document.getElementById('users-list');
    if (!container) return;

    try {
        const users = await getUsers();
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const isAdmin = currentUser?.role === 'admin';

        container.innerHTML = users.map(user => `
            <div class="user-list-item" data-username="${user.username}">
                <div class="user-info">
                    <strong>${user.username}</strong> 
                    <span class="role">(${user.role})</span>
                </div>
                ${isAdmin && user.username !== 'admin' ? `
                    <button onclick="toggleEditUser('${user.username}')" class="edit-user-btn">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <form class="edit-form" onsubmit="updateUser(event, '${user.username}')">
                        <input type="text" name="username" value="${user.username}" required>
                        <input type="password" name="password" placeholder="New Password (leave blank to keep current)">
                        <select name="role" required>
                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                        <div class="user-actions">
                            <button type="submit" class="save-user-btn">Save Changes</button>
                            <button type="button" class="delete-user-btn" onclick="deleteUser('${user.username}')">Delete User</button>
                        </div>
                    </form>
                ` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error rendering users:', error);
        showNotification('Error loading users', 'error');
    }
}

function toggleEditUser(username) {
    const userCard = document.querySelector(`.user-list-item[data-username="${username}"]`);
    
    // Close any other expanded cards
    document.querySelectorAll('.user-list-item.expanded').forEach(card => {
        if (card !== userCard) {
            card.classList.remove('expanded');
        }
    });
    
    userCard.classList.toggle('expanded');
}

async function updateUser(event, username) {
    event.preventDefault();
    const form = event.target;
    
    try {
        const users = await getUsers();
        const userIndex = users.findIndex(u => u.username === username);

        if (userIndex === -1) return;

        users[userIndex] = {
            username: form.username.value,
            password: form.password.value || users[userIndex].password,
            role: form.role.value
        };

        await saveUsers(users);
        showNotification('User updated successfully');
        await renderUsers();
    } catch (error) {
        console.error('Error updating user:', error);
        showNotification('Error updating user', 'error');
    }
}

async function changePassword(event) {
    event.preventDefault();
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const users = await getData('users') || [];
    const userIndex = users.findIndex(u => u.username === currentUser.username);

    if (event.target.newPassword.value !== event.target.confirmPassword.value) {
        showNotification('New passwords do not match', 'error');
        return;
    }

    if (users[userIndex].password !== event.target.currentPassword.value) {
        showNotification('Current password is incorrect', 'error');
        return;
    }

    users[userIndex].password = event.target.newPassword.value;
    await setData('users', users);
    showNotification('Password changed successfully');
    event.target.reset();
}

// Modify existing initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminInterface();
});

// Add this to your admin.js file
function addUser(username, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [defaultAdmin];
    
    // Check if user already exists
    if (users.find(u => u.username === username)) {
        return false;
    }
    
    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    return true;
}

function removeUser(username) {
    const users = JSON.parse(localStorage.getItem('users')) || [defaultAdmin];
    
    // Don't remove default admin
    if (username === 'admin') {
        return false;
    }
    
    const filteredUsers = users.filter(u => u.username !== username);
    localStorage.setItem('users', JSON.stringify(filteredUsers));
    return true;
}

function logout() {
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// ...existing code...

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('active');
}

function showUserManagement() {
    // Hide other sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show user management
    document.getElementById('userManagement').style.display = 'block';
    
    // Load users
    renderUsers();
}

async function addNewUser(event) {
    event.preventDefault();
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (currentUser?.username !== 'admin') {
        showNotification('Only admin can add users', 'error');
        return;
    }

    const username = event.target.username.value;
    const password = event.target.password.value;
    
    try {
        const users = await getData('users') || [defaultAdmin];
        
        if (users.find(u => u.username === username)) {
            showNotification('Username already exists', 'error');
            return;
        }
        
        users.push({ username, password, role: 'user' });
        await setData('users', users);
        showNotification('User added successfully');
        event.target.reset();
        renderUsers();
    } catch (error) {
        showNotification('Error adding user', 'error');
    }
}

// Update current username display
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser) {
        document.getElementById('currentUsername').innerHTML = `
            ${currentUser.username} <span class="role">${currentUser.role}</span>
        `;
    }
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
        document.getElementById('userDropdown').classList.remove('active');
    }
});

/* ...existing code... */

// Add this function to check user permissions
function checkAdminAccess() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    return currentUser?.role === 'admin';
}

// Modify the initialization to hide user management for non-admins
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    // Hide user management button if not admin
    if (currentUser?.role !== 'admin') {
        const userManagementBtn = document.querySelector('button[onclick="showUserManagement()"]');
        if (userManagementBtn) {
            userManagementBtn.style.display = 'none';
        }
    }

    initializeAdminInterface();
});

// Modify the showUserManagement function
function showUserManagement() {
    if (!checkAdminAccess()) {
        showNotification('Access denied. Admin privileges required.', 'error');
        return;
    }

    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });
    
    document.getElementById('userManagement').style.display = 'block';
    renderUsers();
}

// Modify addNewUser function
async function addNewUser(event) {
    event.preventDefault();
    
    if (!checkAdminAccess()) {
        showNotification('Only administrators can add users', 'error');
        return;
    }

    const username = event.target.username.value;
    const password = event.target.password.value;
    const role = event.target.role.value;
    
    try {
        const users = await getData('users') || [defaultAdmin];
        
        if (users.find(u => u.username === username)) {
            showNotification('Username already exists', 'error');
            return;
        }
        
        users.push({ username, password, role });
        await setData('users', users);
        showNotification('User added successfully');
        event.target.reset();
        renderUsers();
    } catch (error) {
        showNotification('Error adding user', 'error');
    }
}

// Update renderUsers function to hide admin controls from non-admins
async function renderUsers() {
    const container = document.getElementById('users-list');
    if (!container) return;

    try {
        const users = await getUsers();
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const isAdmin = currentUser?.role === 'admin';

        container.innerHTML = users.map(user => `
            <div class="user-list-item" data-username="${user.username}">
                <div class="user-info">
                    <strong>${user.username}</strong> 
                    <span class="role">(${user.role})</span>
                </div>
                ${isAdmin && user.username !== 'admin' ? `
                    <button onclick="toggleEditUser('${user.username}')" class="edit-user-btn">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <form class="edit-form" onsubmit="updateUser(event, '${user.username}')">
                        <input type="text" name="username" value="${user.username}" required>
                        <input type="password" name="password" placeholder="New Password (leave blank to keep current)">
                        <select name="role" required>
                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                        <div class="user-actions">
                            <button type="submit" class="save-user-btn">Save Changes</button>
                            <button type="button" class="delete-user-btn" onclick="deleteUser('${user.username}')">Delete User</button>
                        </div>
                    </form>
                ` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error rendering users:', error);
        showNotification('Error loading users', 'error');
    }
}

/* ...existing code... */

/* ...existing code... */

function confirmDeleteUser() {
    const userId = document.getElementById('editUserForm').userId.value;
    const username = document.getElementById('editUserForm').username.value;
    
    if (confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
        deleteUser(userId);
    }
}

// Update the deleteUser function
async function deleteUser(userId) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (currentUser?.role !== 'admin') {
        showNotification('Only administrators can delete users', 'error');
        return;
    }

    if (userId === 'admin') {
        showNotification('Cannot delete main admin account', 'error');
        return;
    }

    try {
        // Get current users from file
        let users = await getUsers();
        console.log('Before deletion:', users); // Debug log
        
        // Filter out the deleted user
        users = users.filter(u => u.username !== userId);
        console.log('After deletion:', users); // Debug log
        
        // Save updated users list to file
        const saveResult = await saveUsers(users);
        if (!saveResult) {
            throw new Error('Failed to save updated users list');
        }
        
        showNotification('User deleted successfully');
        await renderUsers(); // Re-render the users list
        
        // Close modal if open
        const modal = document.getElementById('editUserModal');
        if (modal && modal.style.display === 'block') {
            closeEditUserModal();
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Error deleting user: ' + error.message, 'error');
    }
}

// Update the renderUsers function to include proper delete button handling
async function renderUsers() {
    const container = document.getElementById('users-list');
    if (!container) return;

    try {
        const users = await getUsers();
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const isAdmin = currentUser?.role === 'admin';

        container.innerHTML = users.map(user => `
            <div class="user-list-item" data-username="${user.username}">
                <div class="user-info">
                    <strong>${user.username}</strong> (${user.role})
                </div>
                ${isAdmin && user.username !== 'admin' ? `
                    <div class="user-actions">
                        <button class="edit-user-btn" onclick="editUser('${user.username}')">Edit</button>
                        <button class="delete-user-btn" onclick="deleteUser('${user.username}')">Delete</button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error rendering users:', error);
        showNotification('Error loading users', 'error');
    }
}

// Update confirmDeleteUser function
function confirmDeleteUser(username) {
    if (confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
        deleteUser(username);
    }
}

// ...existing code...