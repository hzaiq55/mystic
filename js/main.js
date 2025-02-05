// Add at the beginning of the file
const performanceOptimizations = {
    init() {
        this.lazyLoadImages();
        this.optimizeEventListeners();
        this.smoothDarkMode();
    },

    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.addEventListener('load', () => img.classList.add('loaded'));
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    },

    optimizeEventListeners() {
        // Debounce scroll events
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                window.cancelAnimationFrame(scrollTimeout);
            }
            scrollTimeout = window.requestAnimationFrame(() => {
                // Your scroll handling code
            });
        }, { passive: true });
    },

    smoothDarkMode() {
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const body = document.body;

        const applyTheme = (e) => {
            if (e.matches) {
                body.classList.add('dark-mode');
            } else {
                body.classList.remove('dark-mode');
            }
        };

        darkModeMediaQuery.addListener(applyTheme);
        applyTheme(darkModeMediaQuery);
    }
};

// Initialize optimizations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    performanceOptimizations.init();
});

// State Management
let state = {
    artists: [],
    releases: [],
    careers: []
};

// Update the getData and setData functions to use the IP address

async function getData(key) {
    try {
        const response = await fetch(`api/storage.php?action=get&file=${key}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error reading data:', error);
        return null;
    }
}

async function setData(key, value) {
    try {
        await fetch(`api/storage.php?action=set&file=${key}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(value)
        });
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// DOM Elements
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const closeModal = document.querySelector('.close-modal');


// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);

// Modify the event listeners section to check if elements exist first
if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
}

if (closeModal) {
    closeModal.addEventListener('click', closeModalWindow);
}

// After your existing event listeners, add this:
document.addEventListener('click', function(event) {
    // Check if menu is open and click is outside menu
    if (navLinks.classList.contains('active')) {
        // Check if click is outside both the menu and the menu toggle button
        if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
            toggleMenu();
        }
    }
});

// Initialize Application based on page context
async function initializeApp() {
    if (document.querySelector('.artists-grid')) {
        // We're on the main page
        await loadData();
        renderArtists();
        renderReleases();
        renderCareers();
    }
}

//smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        // Close mobile menu if it's open
        if (navLinks.classList.contains('active')) {
            toggleMenu();
        }

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});


// Navigation Functions
function toggleMenu() {
    navLinks.classList.toggle('active');
    const spans = menuToggle.getElementsByTagName('span');
    Array.from(spans).forEach(span => span.classList.toggle('active'));
    
    // Toggle body scroll when menu is open
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
}

function scrollToReleases() {
    document.getElementById('releases').scrollIntoView({ behavior: 'smooth' });
}

// Data Loading
async function loadData() {
    try {
        console.log('Loading data...');
        
        // Load artists with logging
        const artists = await getData('artists');
        console.log('Loaded artists:', artists);
        state.artists = artists || [];
        
        // Load releases
        state.releases = await getData('releases') || [
            { id: 1, name: 'Midnight Dreams', genre: 'Electronic', link: 'https://example.com/track1' },
            { id: 2, name: 'Solar Winds', genre: 'Ambient', link: 'https://example.com/track2' }
        ];
        
        // Load careers
        state.careers = await getData('careers') || [
            { id: 1, title: 'Audio Engineer', description: 'Looking for experienced audio engineer...' },
            { id: 2, title: 'Marketing Manager', description: 'Seeking creative marketing professional...' }
        ];

        // Render the UI after loading data
        renderArtists();
        renderReleases();
        renderCareers();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Render Functions
function renderArtists() {
    const container = document.getElementById('artists-container');
    container.innerHTML = state.artists.map(artist => `
        <div class="card" onclick="showArtistDetails(${artist.id})">
            <img src="${artist.image}" alt="${artist.name}">
            <div class="card-content">
                <h3>${artist.name}</h3>
                <p>${artist.genre}</p>
            </div>
        </div>
    `).join('');
}

function renderReleases() {
    const container = document.getElementById('releases-container');
    // Add null check
    if (!container) return;
    
    container.innerHTML = state.releases.map(release => `
        <div class="card" onclick="openReleaseLink('${release.link}')">
            <div class="card-content">
                <h3>${release.name}</h3>
                <p>${release.genre}</p>
            </div>
        </div>
    `).join('');
}

function renderCareers() {
    const container = document.getElementById('career-container');
    // Add null check and early return
    if (!container) return;
    
    if (!state.careers || !Array.isArray(state.careers)) {
        console.error('Invalid careers data:', state.careers);
        return;
    }
    
    container.innerHTML = state.careers.map(career => `
        <div class="card" onclick="showCareerForm(${career.id})">
            <div class="card-content">
                <h3>${career.title}</h3>
                <p>${career.description}</p>
            </div>
        </div>
    `).join('');
}

// Modal Functions
function showArtistDetails(artistId) {
    const artist = state.artists.find(a => a.id === artistId);
    showModal(`
        
        <img src="${artist.image}" alt="${artist.name}" style="max-width: 100%;">
        <h2>${artist.name}</h2>
        <p>${artist.details}</p>
    `);
}
//forms
function showCareerForm(careerId) {
    const career = state.careers.find(c => c.id === careerId);
    showModal(`
        <h2>Apply for ${career.title}</h2>
        <form onsubmit="handleCareerSubmit(event)" data-career-id="${career.id}">
        <br>
            <input type="text" name="name" placeholder="Your Name" required>
            <br>
            <input type="email" name="email" placeholder="Your Email" required>
            <br>
            <textarea name="description" placeholder="Your Description" required></textarea>
            <br>
            <button type="submit">Submit Application</button>
        </form>
    `);
    modal.dataset.careerId = career.id;
}

function showModal(content) {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');
    
    modalContent.innerHTML = content;
    modal.style.display = 'flex';
    
    // Force a reflow before adding the show class
    void modal.offsetWidth;
    
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
}

function closeModalWindow() {
    const modal = document.getElementById('modal');
    
    modal.classList.remove('show');
    
    // Wait for both opacity and transform animations to complete
    setTimeout(() => {
        modal.style.display = 'none';
        modal.querySelector('#modal-content').innerHTML = '';
    }, 300);
}

// Form Handlers

async function handleContactSubmit(event) {
    event.preventDefault();
    try {
        // Get existing messages
        const messages = await getData('messages') || [];
        
        // Create new message with ID
        const newMessage = {
            id: messages.length + 1,
            name: event.target.name.value,
            email: event.target.email.value,
            message: event.target.message.value,
            timestamp: new Date().toISOString()
        };
        
        // Add to existing messages
        messages.push(newMessage);
        
        // Save updated messages
        await setData('messages', messages);
        
        // Show success message
        showModal('<h2>Thanks for your message!</h2><br><p>We will get back to you soon.</p>');
        event.target.reset();
    } catch (error) {
        console.error('Error sending message:', error);
        showModal('<h2>Error</h2><br><p>Failed to send message. Please try again.</p>');
    }
}

async function handleCareerSubmit(event) {
    event.preventDefault();
    try {
        // Get existing applications
        const applications = await getData('applications') || [];
        
        // Get the career details
        const careerId = event.target.closest('.modal').dataset.careerId;
        const career = state.careers.find(c => c.id === parseInt(careerId));
        
        // Create new application with ID
        const newApplication = {
            id: applications.length + 1,
            careerId: parseInt(careerId),
            position: career.title,
            name: event.target.name.value,
            email: event.target.email.value,
            description: event.target.description.value,
            timestamp: new Date().toISOString()
        };
        
        // Add to existing applications
        applications.push(newApplication);
        
        // Save updated applications
        await setData('applications', applications);
        
        // Show success message and close modal
        showModal('<h2>Thanks for your application!</h2><br><p>We will contact you soon.</p>');
        event.target.reset();
    } catch (error) {
        console.error('Error submitting application:', error);
        showModal('<h2>Error</h2><br><p>Failed to submit application. Please try again.</p>');
    }
}

function openReleaseLink(link) {
    window.open(link, '_blank');
}
//home link
document.getElementById('home-link').addEventListener('click', function(event) {
    // Prevent default anchor click behavior
    event.preventDefault();

    // Scroll to the top of the page
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Smooth scroll effect
    });
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModalWindow();
    }
};

document.addEventListener('DOMContentLoaded', async function() {
    // Update hero section from server-side storage
    const heroText = await getData('heroText');
    const heroButtonLink = await getData('heroButtonLink');
    
    if (heroText) {
        document.querySelector('.hero-text').textContent = heroText;
    }
    
    if (heroButtonLink) {
        document.querySelector('.hero-button').href = heroButtonLink;
    }

    // Section headings animation on scroll
    const sectionHeadings = document.querySelectorAll('.section h2');
    
    const headingObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('heading-zoom');
                headingObserver.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '-10px'
    });

    sectionHeadings.forEach(heading => {
        heading.classList.add('heading-animation');
        headingObserver.observe(heading);
    });
});

// Select the flip element
const flipElement = document.querySelector('.flip');

// Function to trigger the flip animation
function triggerFlip() {
    // Add the flip class to start the animation
    flipElement.classList.add('flipping');

    // Remove the class after the animation duration to reset
    setTimeout(() => {
        flipElement.classList.remove('flipping');
    }, 600); // Match this duration with the CSS transition duration
}

// Add mouseenter and mouseleave event listeners
flipElement.addEventListener('mouseenter', triggerFlip);

const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
// Check if dark mode is enabled on page load
if (darkModeMediaQuery.matches) {
    document.body.classList.add('dark-mode'); // Add dark mode class if preferred
}

// Listen for changes in the dark mode preference
darkModeMediaQuery.addEventListener('change', (event) => {
    if (event.matches) {
        document.body.classList.add('dark-mode');
        document.querySelector('meta[name="theme-color"]').setAttribute('content', '#000000');
    } else {
        document.body.classList.remove('dark-mode');
        document.querySelector('meta[name="theme-color"]').setAttribute('content', '#ffffff');
    }
});

