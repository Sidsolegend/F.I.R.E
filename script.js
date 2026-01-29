document.addEventListener('DOMContentLoaded', () => {
    // Loader Handling
    window.addEventListener('load', () => {
        const loader = document.getElementById('loader');
        if (loader) {
            setTimeout(() => {
                loader.classList.add('fade-out');
            }, 1000); // Minimum duration for effect
        }
    });

    // --- State Management ---
    const defaultClubs = [
        { id: 1, name: "GIIS Robotics Club", category: "stem", status: "open", desc: "Educates on computer aided designing and fosters innovation in engineering and mechanics.", teacher: "Ms. Radha", year: "2017" },
        { id: 2, name: "GIIS Debate Society", category: "academic", status: "open", desc: "Fostering critical thinking and public speaking through structured parliamentary debates.", teacher: "Ms. Sunita", year: "2015" },
        { id: 3, name: "GIIS Chess Club", category: "strategy", status: "closed", desc: "Master the game of kings. Regular tournaments, strategy workshops, and friendly matches.", teacher: "Mr. Robert", year: "2019" },
        { id: 4, name: "GIIS Dance For Change Club", category: "arts", status: "open", desc: "Using dance as a medium for social change and artistic expression.", teacher: "Akshara Ma'am", year: "2020" },
        { id: 5, name: "GIIS Music Club", category: "arts", status: "open", desc: "For vocalists and instrumentalists to collaborate and perform.", teacher: "Mr. Jason", year: "2019" },
        { id: 6, name: "GIIS Girl Up Rise", category: "leadership", status: "open", desc: "Empowering women and girls to be leaders and changemakers.", teacher: "Ms. Sarah", year: "2021" },
        { id: 7, name: "Biology & Beyond (BIOND)", category: "stem", status: "display", desc: "Exploring the wonders of life sciences through experiments and research.", teacher: "Dr. Aditi", year: "2022" },
        { id: 8, name: "ODAC", category: "lifestyle", status: "open", desc: "Outdoor Adventure Club. Hiking, camping, and connecting with nature.", teacher: "Mr. Mike", year: "2018" },
        { id: 9, name: "GIIS Sports Club", category: "sports", status: "open", desc: "Promoting fitness, teamwork, and competitive spirit across various sports.", teacher: "Coach Lee", year: "2017" },
        { id: 10, name: "GIIS Photography Club", category: "arts", status: "open", desc: "Capturing moments and mastering the art of visual storytelling.", teacher: "Mr. David", year: "2019" },
        { id: 11, name: "Student Study Support Club", category: "academic", status: "open", desc: "Peer-to-peer tutoring and study groups to help everyone succeed.", teacher: "Ms. Emily", year: "2020" },
        { id: 12, name: "GIIS Law Society", category: "academic", status: "open", desc: "Debating legal frameworks, mock trials, and understanding justice.", teacher: "Mr. James", year: "2021" },
        { id: 13, name: "GIIS Art Club", category: "arts", status: "open", desc: "Expressing creativity through painting, sketching, and digital art.", teacher: "Ms. Priya", year: "2016" },
        { id: 14, name: "GIIS Econs & Biz Club", category: "business", status: "open", desc: "Platform to learn about economical and business related issues through debates.", teacher: "Ms. Nidhi", year: "2021" },
        { id: 15, name: "GIIS Psychology Club", category: "health", status: "open", desc: "Raising awareness on mental health and helping students dedicate time to themselves.", teacher: "Ms. Anisha", year: "2021" },
        { id: 16, name: "GIIS Aviation & Astronomy", category: "stem", status: "open", desc: "Empowering students to explore, design, and innovate at the frontiers of aerospace.", teacher: "Mr. Joseph", year: "2017" },
        { id: 17, name: "GIIS Culinary Club", category: "lifestyle", status: "open", desc: "Showcasing the importance of food while enhancing cooking skills.", teacher: "Ms. Archana", year: "2017" },
        { id: 18, name: "GIIS TedX Club", category: "leadership", status: "open", desc: "Spread ideas through motivational and inspiring talks. Encourage students to find identity.", teacher: "Ms. Shivalik", year: "2015" }
    ];

    // Data validation: Check for corrupted club data and reset if needed
    let clubs = JSON.parse(localStorage.getItem('fire_clubs')) || defaultClubs;

    // Fix corrupted data (duplicate names like "Robotics & AI ClubGIIS Robotics Club")
    const hasCorruptedData = clubs.some(club => {
        const nameWords = club.name.split(' ');
        // Check if name contains "Club" multiple times or has obvious duplication
        const clubCount = nameWords.filter(word => word.toLowerCase().includes('club')).length;
        return clubCount > 1 || club.name.includes('ClubGIIS') || club.name.includes('ClubG');
    });

    if (hasCorruptedData) {
        console.warn('Corrupted club data detected. Resetting to defaults...');
        clubs = defaultClubs;
        localStorage.setItem('fire_clubs', JSON.stringify(defaultClubs));
    }

    let favorites = JSON.parse(localStorage.getItem('fire_favorites')) || [];
    let currentUser = null;
    let activeFilter = 'all';
    let searchQuery = '';

    // --- Dark Mode ---
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        if (darkModeToggle) {
            darkModeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        }
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);

            const icon = darkModeToggle.querySelector('i');
            if (isDark) {
                icon.classList.replace('fa-moon', 'fa-sun');
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
            }

            showToast(isDark ? 'Dark mode enabled' : 'Light mode enabled');
        });
    }

    // (Notification Center logic moved to common interactive section)

    // --- Favorites System ---
    const toggleFavorite = (clubId) => {
        const index = favorites.indexOf(clubId);
        if (index > -1) {
            favorites.splice(index, 1);
            showToast('Removed from favorites');
        } else {
            favorites.push(clubId);
            showToast('Added to favorites');
        }
        localStorage.setItem('fire_favorites', JSON.stringify(favorites));
        renderClubs();
    };

    window.toggleFavorite = toggleFavorite;

    // --- Helper Functions ---
    const showToast = (message) => {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    };

    const saveClubs = () => {
        localStorage.setItem('fire_clubs', JSON.stringify(clubs));
        renderClubs();
        renderAdminList();
    };

    const getTagClass = (category) => {
        const map = {
            'stem': 'stem', 'arts': 'arts', 'business': 'business',
            'sports': 'sports', 'leadership': 'leadership',
            'service': 'service', 'academic': 'academic',
            'health': 'health', 'lifestyle': 'lifestyle', 'strategy': 'strategy'
        };
        return map[category] || 'academic';
    };

    const getTagLabel = (category) => {
        const map = {
            'stem': 'STEM', 'arts': 'Arts & Culture', 'business': 'Business',
            'sports': 'Sports', 'leadership': 'Leadership',
            'service': 'Service', 'academic': 'Academic',
            'health': 'Health & Science', 'lifestyle': 'Lifestyle', 'strategy': 'Strategy & Games'
        };
        return map[category] || category.toUpperCase();
    };

    // --- Rendering Logic ---
    const renderClubs = () => {
        const container = document.getElementById('clubs-container');
        if (!container) return;

        // Visual feedback for filter change
        container.style.opacity = '0';
        container.style.transform = 'translateY(10px)';

        setTimeout(() => {
            container.innerHTML = '';

            const filteredClubs = clubs.filter(club => {
                const matchesFilter = activeFilter === 'all' ||
                    (activeFilter === 'favorites' ? favorites.includes(club.id) : club.category === activeFilter);
                const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    club.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    club.teacher.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesFilter && matchesSearch;
            });

            if (filteredClubs.length === 0) {
                container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
                <i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>No clubs found matching your criteria.</p>
            </div>`;
                return;
            }

            filteredClubs.forEach(club => {
                const card = document.createElement('div');
                card.className = "club-card fade-in";
                card.setAttribute('data-category', club.category); // For Elite CSS Highlights

                // Favorite Button
                const isFavorited = favorites.includes(club.id);
                const favoriteBtn = `
                <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" onclick="toggleFavorite(${club.id})" title="${isFavorited ? 'Remove from favorites' : 'Add to favorites'}">
                    <i class="fa-${isFavorited ? 'solid' : 'regular'} fa-heart"></i>
                </button>
            `;

                // Admin Edit Button Overlay
                let adminControls = '';
                if (currentUser && currentUser.role === 'admin') {
                    adminControls = `
                <div style="position: absolute; top: 1rem; left: 1rem; z-index: 10;">
                    <button class="btn-sm btn-nav" style="background: white; color: var(--accent-primary); border: 1px solid var(--accent-primary); padding: 0.2rem 0.6rem; font-size: 0.7rem;" onclick="openEditClub(${club.id})">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                </div>`;
                }

                card.innerHTML = `
                ${favoriteBtn}
                ${adminControls}
                <div class="card-header">
                    <span class="tag ${getTagClass(club.category)}">${getTagLabel(club.category)}</span>
                    <span class="status ${club.status}">${club.status}</span>
                </div>
                <h3>${club.name}</h3>
                <p class="description">${club.desc}</p>
                <div class="card-footer">
                    <div class="meta">
                        <span><i class="fa-regular fa-calendar"></i> Est. ${club.year}</span>
                        <span><i class="fa-regular fa-user"></i> ${club.teacher}</span>
                    </div>
                    <a href="#" class="icon-link"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                </div>
            `;
                container.appendChild(card);
            });

            // Restore visibility with animation
            requestAnimationFrame(() => {
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            });

            // Re-trigger fade-in observer for new elements
            const fadeElements = document.querySelectorAll('.fade-in');
            fadeElements.forEach(el => observer.observe(el));
        }, 100); // Small delay for visual effect
    };

    // --- Admin Dashboard Logic ---
    const renderAdminList = () => {
        const list = document.getElementById('admin-club-list');
        if (!list) return;

        list.innerHTML = '';
        clubs.forEach(club => {
            const item = document.createElement('div');
            item.className = 'admin-list-item';
            item.innerHTML = `
                <div style="flex: 1;"><strong>${club.name}</strong> <span style="font-size: 0.8rem; color: #718096">(${club.category})</span></div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-icon-sm" onclick="openEditClub(${club.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon-sm delete" onclick="deleteClub(${club.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            list.appendChild(item);
        });
    };

    window.showAddClubForm = () => {
        document.getElementById('admin-view-list').style.display = 'none';
        document.getElementById('admin-view-form').style.display = 'block';
        document.getElementById('club-form').reset();
        document.getElementById('club-id').value = '';
    };

    window.hideAddClubForm = () => {
        document.getElementById('admin-view-list').style.display = 'block';
        document.getElementById('admin-view-form').style.display = 'none';
    };

    window.openEditClub = (id) => {
        const club = clubs.find(c => c.id === id);
        if (!club) return;

        // Open Modal first if triggered from card
        const adminModal = document.getElementById('admin-modal');
        if (!adminModal.classList.contains('active')) {
            adminModal.classList.add('active');
        }

        showAddClubForm();
        document.getElementById('club-id').value = club.id;
        document.getElementById('club-name').value = club.name;
        document.getElementById('club-category').value = club.category;
        document.getElementById('club-status').value = club.status;
        document.getElementById('club-desc').value = club.desc;
        document.getElementById('club-teacher').value = club.teacher;
        document.getElementById('club-year').value = club.year;
    };

    window.deleteClub = (id) => {
        if (confirm("Are you sure you want to delete this club?")) {
            clubs = clubs.filter(c => c.id !== id);
            saveClubs();
        }
    };

    const clubForm = document.getElementById('club-form');
    if (clubForm) {
        clubForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('club-id').value;

            const newClub = {
                id: id ? parseInt(id) : Date.now(),
                name: document.getElementById('club-name').value,
                category: document.getElementById('club-category').value,
                status: document.getElementById('club-status').value,
                desc: document.getElementById('club-desc').value,
                teacher: document.getElementById('club-teacher').value,
                year: document.getElementById('club-year').value,
            };

            if (id) {
                // Update
                const index = clubs.findIndex(c => c.id == id);
                if (index !== -1) clubs[index] = newClub;
            } else {
                // Add
                clubs.push(newClub);
            }

            saveClubs();
            hideAddClubForm();
        });
    }

    // --- Animations & Other Init ---
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    // Navbar Scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            navbar.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
            navbar.style.background = "rgba(255, 255, 255, 0.95)";
        } else {
            navbar.classList.remove('scrolled');
            navbar.style.boxShadow = "none";
            navbar.style.background = "rgba(255, 255, 255, 0.9)";
        }
    });

    // Calendar & Auth (Existing Logic + Admin)
    const loginModal = document.getElementById('login-modal');
    const adminModal = document.getElementById('admin-modal');
    const authSection = document.getElementById('auth-section');

    window.openLoginModal = () => loginModal.classList.add('active');
    window.closeLoginModal = () => loginModal.classList.remove('active');

    window.closeAdminModal = () => {
        adminModal.classList.remove('active');
        hideAddClubForm(); // Reset to list view
    };

    window.openAdminDashboard = () => {
        if (currentUser && currentUser.role === 'admin') {
            adminModal.classList.add('active');
            renderAdminList();
        }
    };

    // Close Modals on Outside Click
    window.onclick = (e) => {
        if (e.target === loginModal) closeLoginModal();
        if (e.target === adminModal) closeAdminModal();
    };

    // Switch between login and registration views
    window.switchToRegister = (e) => {
        if (e) e.preventDefault();
        document.getElementById('login-view').style.display = 'none';
        document.getElementById('register-view').style.display = 'block';
    };

    window.switchToLogin = (e) => {
        if (e) e.preventDefault();
        document.getElementById('login-view').style.display = 'block';
        document.getElementById('register-view').style.display = 'none';
    };

    // Role description updater
    const roleSelect = document.getElementById('reg-role');
    if (roleSelect) {
        roleSelect.addEventListener('change', (e) => {
            const roleDesc = document.getElementById('role-description');
            if (!roleDesc) return;
            const descriptions = {
                'student': 'Browse clubs, register for events, and join communities.',
                'club-leader': 'Manage your club profile, submit events, and track members.',
                'admin': 'Full access to moderate content, approve clubs, and manage users.'
            };
            roleDesc.textContent = descriptions[e.target.value] || 'Choose the role that best describes you.';
        });
    }

    // Registration Form Handler
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const firstName = document.getElementById('reg-firstname').value;
            const lastName = document.getElementById('reg-lastname').value;
            const email = document.getElementById('reg-email').value.toLowerCase();
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm-password').value;
            const role = document.getElementById('reg-role').value;
            const btn = registerForm.querySelector('button[type="submit"]');

            // Validation
            if (!role) {
                showToast('Please select an account type');
                return;
            }

            if (password !== confirmPassword) {
                showToast('Passwords do not match');
                return;
            }

            if (password.length < 6) {
                showToast('Password must be at least 6 characters');
                return;
            }

            btn.textContent = 'Creating Account...';
            btn.disabled = true;

            setTimeout(() => {
                // Get existing users or initialize
                let users = JSON.parse(localStorage.getItem('fire_users')) || [];

                // Check if email already exists
                if (users.find(u => u.email === email)) {
                    showToast('Email already registered. Please login.');
                    btn.textContent = 'Create Account';
                    btn.disabled = false;
                    return;
                }

                // Create new user
                const newUser = {
                    id: Date.now(),
                    firstName,
                    lastName,
                    email,
                    password, // In production, this would be hashed
                    role,
                    createdAt: new Date().toISOString(),
                    privileges: getRolePrivileges(role)
                };

                users.push(newUser);
                localStorage.setItem('fire_users', JSON.stringify(users));

                // Auto-login after registration
                currentUser = { email, role, firstName, lastName, privileges: newUser.privileges };

                closeLoginModal();
                btn.textContent = 'Create Account';
                btn.disabled = false;
                registerForm.reset();
                switchToLogin();

                // Update Navbar
                updateNavbarForUser(currentUser);

                showToast(`Welcome ${firstName}! Your ${role} account has been created.`);
                renderClubs();
            }, 1000);
        });
    }

    // Helper function to define role privileges
    function getRolePrivileges(role) {
        const privileges = {
            'student': {
                canBrowseClubs: true,
                canJoinClubs: true,
                canViewEvents: true,
                canManageClubs: false,
                canModerateContent: false
            },
            'club-leader': {
                canBrowseClubs: true,
                canJoinClubs: true,
                canViewEvents: true,
                canManageClubs: true,
                canSubmitEvents: true,
                canModerateContent: false
            },
            'admin': {
                canBrowseClubs: true,
                canJoinClubs: true,
                canViewEvents: true,
                canManageClubs: true,
                canSubmitEvents: true,
                canModerateContent: true,
                canApproveClubs: true,
                canManageUsers: true
            }
        };
        return privileges[role] || privileges['student'];
    }

    // Update navbar based on user
    function updateNavbarForUser(user) {
        if (!authSection) return;

        let html = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div title="${user.role}" style="width: 35px; height: 35px; background: ${user.role === 'admin' ? '#E53E3E' : user.role === 'club-leader' ? '#805AD5' : '#38B2AC'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; cursor: pointer;">
                    ${user.firstName ? user.firstName[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
        `;

        if (user.role === 'admin') {
            html += `
                <button class="btn-nav btn-sm" onclick="openAdminDashboard()" style="font-size: 0.85rem; padding: 0.4rem 1rem;">
                    <i class="fa-solid fa-lock"></i> Admin
                </button>
            `;
        } else if (user.role === 'club-leader') {
            html += `
                <button class="btn-nav btn-sm" onclick="openAdminDashboard()" style="font-size: 0.85rem; padding: 0.4rem 1rem;">
                    <i class="fa-solid fa-id-badge"></i> Manage
                </button>
            `;
        }
        html += `</div>`;
        authSection.innerHTML = html;
    }

    // Login Form Handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.toLowerCase();
            const password = document.getElementById('login-password').value;
            const btn = loginForm.querySelector('button');

            btn.textContent = 'Authenticating...';
            btn.disabled = true;

            setTimeout(() => {
                // Check for default admin account
                if (email === 'admin@fire.edu' && password === 'admin123') {
                    currentUser = {
                        email,
                        role: 'admin',
                        firstName: 'Admin',
                        lastName: 'User',
                        privileges: getRolePrivileges('admin')
                    };
                    closeLoginModal();
                    btn.textContent = 'Sign In';
                    btn.disabled = false;
                    updateNavbarForUser(currentUser);
                    showToast('Logged in as Administrator');
                    renderClubs();
                    return;
                }

                // Check registered users
                const users = JSON.parse(localStorage.getItem('fire_users')) || [];
                const user = users.find(u => u.email === email && u.password === password);

                if (user) {
                    currentUser = {
                        email: user.email,
                        role: user.role,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        privileges: user.privileges
                    };
                    closeLoginModal();
                    btn.textContent = 'Sign In';
                    btn.disabled = false;
                    updateNavbarForUser(currentUser);
                    showToast(`Welcome back, ${user.firstName}!`);
                    renderClubs();
                } else {
                    showToast('Invalid email or password');
                    btn.textContent = 'Sign In';
                    btn.disabled = false;
                }
            }, 800);
        });
    }

    // --- Interactive Elements ---

    // 1. Notification Center
    const notificationBtn = document.getElementById('notification-btn');
    const notificationDropdown = document.getElementById('notification-dropdown');
    const notificationBadge = document.querySelector('.notification-badge');

    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!notificationDropdown.contains(e.target) && e.target !== notificationBtn) {
                notificationDropdown.classList.remove('active');
            }
        });

        const clearBtn = notificationDropdown.querySelector('.clear-all');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                const list = notificationDropdown.querySelector('.notification-list');
                if (list) list.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">No notifications</div>';
                if (notificationBadge) notificationBadge.style.display = 'none';
                showToast('Notifications cleared');
            });
        }
    }

    // 2. Search & Filter
    const searchInput = document.getElementById('club-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderClubs();
        });
    }

    const filterPills = document.querySelectorAll('.pill');
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeFilter = pill.getAttribute('data-filter');
            renderClubs();
        });
    });

    // 3. Parallax, Scroll Progress & Scroll-to-Top
    const orbs = document.querySelectorAll('.hero-gradient-orb');
    const scrollProgress = document.querySelector('.scroll-progress');
    const scrollToTop = document.createElement('button');
    scrollToTop.className = 'scroll-to-top';
    scrollToTop.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    document.body.appendChild(scrollToTop);

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        // Parallax Orbs
        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 0.15;
            orb.style.transform = `translateY(${scrolled * speed}px)`;
        });

        // Scroll Progress
        if (scrollProgress) {
            const percentage = (scrolled / totalHeight) * 100;
            scrollProgress.style.width = `${percentage}%`;
        }

        // Scroll to Top visibility
        if (scrolled > 500) {
            scrollToTop.classList.add('visible');
        } else {
            scrollToTop.classList.remove('visible');
        }
    });

    scrollToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 4. Global Interactivity Feedback
    document.addEventListener('click', (e) => {
        if (e.target.closest('.icon-link')) {
            e.preventDefault();
            showToast("Opening link...");
        }
    });

    // Initial Render
    renderClubs();
    renderCalendarLogic();
});

// Separated Calendar Logic for Elite Interactivity
function renderCalendarLogic() {
    const calendarDays = document.getElementById('calendar-days');
    const monthYearText = document.getElementById('current-month-year');
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');
    const eventsFeed = document.querySelector('.events-feed');
    if (!calendarDays) return;

    let currentDate = new Date();
    let selectedDay = null;

    // Mock Events Data
    const mockEvents = [
        { day: 5, month: 9, year: 2024, name: "Robotics Workshop", time: "10:00 AM" },
        { day: 12, month: 9, year: 2024, name: "Debate Finals", time: "2:30 PM" },
        { day: 15, month: 9, year: 2024, name: "Science Fair Info Session", time: "4:00 PM" },
        { day: 22, month: 9, year: 2024, name: "Community Service Day", time: "9:00 AM" },
        { day: 28, month: 9, year: 2024, name: "Art Exhibition", time: "11:00 AM" }
    ];

    const filterEvents = (day, month, year) => {
        if (!eventsFeed) return;

        const filtered = mockEvents.filter(ev => ev.day === day && ev.month === month && ev.year === year);

        if (filtered.length > 0) {
            eventsFeed.innerHTML = `<h3>Events for Oct ${day}</h3>` + filtered.map(ev => `
                <div class="event-feed-item fade-in visible">
                    <div class="event-date">
                        <span class="day">${ev.day}</span>
                        <span class="month">Oct</span>
                    </div>
                    <div class="event-info">
                        <h4>${ev.name}</h4>
                        <p><i class="fa-regular fa-clock"></i> ${ev.time}</p>
                    </div>
                </div>
            `).join('');
        } else {
            eventsFeed.innerHTML = `<h3>Events for Oct ${day}</h3><p style="padding: 1rem; color: var(--text-muted);">No events scheduled for this day.</p>`;
        }
    };

    const render = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        monthYearText.textContent = `${monthNames[month]} ${year}`;
        calendarDays.innerHTML = '';

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            calendarDays.appendChild(Object.assign(document.createElement('div'), { className: 'c-day empty' }));
        }

        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'c-day';
            dayEl.textContent = i;

            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayEl.classList.add('selected');
            }

            if ([5, 12, 15, 22, 28].includes(i)) {
                dayEl.classList.add('event-dot');
            }

            if (selectedDay === i) dayEl.classList.add('active-filter');

            dayEl.onclick = () => {
                document.querySelectorAll('.c-day').forEach(d => d.classList.remove('active-filter'));
                dayEl.classList.add('active-filter');
                selectedDay = i;
                filterEvents(i, month, year);
            };

            calendarDays.appendChild(dayEl);
        }
    }

    render(currentDate);
    if (prevBtn) prevBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); render(currentDate); };
    if (nextBtn) nextBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); render(currentDate); };
}
