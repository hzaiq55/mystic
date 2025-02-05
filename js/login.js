const defaultAdmin = {
    username: 'admin',
    password: 'admin123',
    role: 'admin'
};

// Function to get users from users.txt
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

async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('error-message');

    try {
        // Get users from file
        const users = await getUsers();
        console.log('Available users:', users); // Debug log
        
        // Find matching user
        const user = users.find(u => 
            u.username === username && 
            u.password === password
        );
        
        if (user) {
            console.log('Login successful:', user);
            sessionStorage.setItem('adminAuthenticated', 'true');
            sessionStorage.setItem('currentUser', JSON.stringify({
                username: user.username,
                role: user.role
            }));
            
            window.location.href = 'admin.html';
        } else {
            console.log('Login failed - no matching user found');
            errorMessage.textContent = 'Invalid username or password';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'An error occurred. Please try again.';
    }
}

// For debugging - add this to check stored users
function checkUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    console.log('Current users in storage:', users);
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', checkUsers);
