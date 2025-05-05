document.addEventListener('DOMContentLoaded', function() {
    const verificationForm = document.getElementById('verificationForm');
    const resultMessage = document.getElementById('resultMessage');
    const verifyBtn = document.querySelector('.verify-btn');
    const buttonText = document.querySelector('.button-text');
    const loader = document.querySelector('.loader');
    const timeRestriction = document.getElementById('timeRestriction');
    const restrictionMessage = document.getElementById('restrictionMessage');
    const adminPasswordForm = document.getElementById('adminPasswordForm');
    const TOTAL_FEE = 9858;

    // Admin password

    let loginAttempts = parseInt(localStorage.getItem('loginAttempts')) || 0;
    const MAX_ATTEMPTS = 3;

    // Handle admin password form if it exists
    if (adminPasswordForm) {
        const adminPassword = document.getElementById('adminPassword');
        const togglePassword = document.getElementById('togglePassword');
        const submitBtn = adminPasswordForm.querySelector('button[type="submit"]');
        const buttonText = submitBtn.querySelector('.button-text');
        const loader = submitBtn.querySelector('.loader');

        // Toggle password visibility
        togglePassword.addEventListener('click', function() {
            const type = adminPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            adminPassword.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });

        // Handle form submission
        adminPasswordForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const password = adminPassword.value;

            if (!password) {
                showResult('Please enter the admin password', 'danger');
                return;
            }

            // Show loading state
            buttonText.style.display = 'none';
            loader.classList.remove('d-none');
            submitBtn.disabled = true;

            try {
                const response = await fetch('http://localhost:3000/api/authenticate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password }),
                });

                const result = await response.json();

                if (response.ok) {
                    // Clear login attempts
                    localStorage.removeItem('loginAttempts');
                    // Redirect to admin page
                    window.location.href = 'admin.html';
                } else {
                    loginAttempts++;
                    localStorage.setItem('loginAttempts', loginAttempts);

                    if (loginAttempts >= MAX_ATTEMPTS) {
                        // Show reset password notification
                        document.getElementById('resetPasswordContainer').classList.remove('d-none');
                        submitBtn.disabled = true;
                    } else {
                        showResult(result.message, 'danger');
                        adminPassword.value = '';
                    }
                }
            } catch (error) {
                showResult('Server error. Please try again later.', 'danger');
            } finally {
                buttonText.style.display = 'block';
                loader.classList.add('d-none');
                submitBtn.disabled = false;
            }
        });

        function showResult(message, type) {
            resultMessage.textContent = message;
            resultMessage.className = `alert alert-${type}`;
            resultMessage.classList.remove('d-none');
        }
    }

    // Check time restrictions on load and every minute
    if (verificationForm) {
        checkTimeRestrictions();
        setInterval(checkTimeRestrictions, 1000);
    }

    function checkTimeRestrictions() {
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();
        
        if (day === 0 || day === 6 || hour < 8 || hour >= 17) {
            showTimeRestriction();
        } else {
            hideTimeRestriction();
        }
    }

    function showTimeRestriction() {
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();
        let nextAvailableTime;

        if (day === 0) { // Sunday
            nextAvailableTime = new Date(now);
            nextAvailableTime.setDate(now.getDate() + 1);
            nextAvailableTime.setHours(8, 0, 0, 0);
        } else if (day === 6) { // Saturday
            nextAvailableTime = new Date(now);
            nextAvailableTime.setDate(now.getDate() + 2);
            nextAvailableTime.setHours(8, 0, 0, 0);
        } else if (hour < 8) { // Before 8 AM
            nextAvailableTime = new Date(now);
            nextAvailableTime.setHours(8, 0, 0, 0);
        } else { // After 5 PM
            nextAvailableTime = new Date(now);
            nextAvailableTime.setDate(now.getDate() + 1);
            nextAvailableTime.setHours(8, 0, 0, 0);
        }

        const timeDiff = nextAvailableTime - now;
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        // Update countdown elements
        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');

        timeRestriction.classList.remove('d-none');
        
        // Disable form inputs and button
        const admissionInput = document.getElementById('admissionNumber');
        const courseInput = document.getElementById('course');
        const verifyButton = document.querySelector('.verify-btn');
        
        admissionInput.disabled = true;
        courseInput.disabled = true;
        verifyButton.disabled = true;
        
        // Add disabled class to form
        verificationForm.classList.add('disabled');
    }

    function hideTimeRestriction() {
        timeRestriction.classList.add('d-none');
        
        // Enable form inputs and button
        const admissionInput = document.getElementById('admissionNumber');
        const courseInput = document.getElementById('course');
        const verifyButton = document.querySelector('.verify-btn');
        
        admissionInput.disabled = false;
        courseInput.disabled = false;
        verifyButton.disabled = false;
        
        // Remove disabled class from form
        verificationForm.classList.remove('disabled');
    }

    verificationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading state
        buttonText.style.display = 'none';
        loader.classList.remove('d-none');
        verifyBtn.disabled = true;

        const admissionNumber = document.getElementById('admissionNumber').value;
        const course = document.getElementById('course').value;

        // Simulate verification delay
        setTimeout(() => {
            verifyStudent(admissionNumber, course);
        }, 2000);
    });

    function verifyStudent(admissionNumber, course) {
        // Get students from localStorage
        const students = JSON.parse(localStorage.getItem('students')) || [];
        const student = students.find(s => 
            s.admissionNumber === admissionNumber && 
            s.course.toLowerCase() === course.toLowerCase()
        );

        // Reset button state
        buttonText.style.display = 'block';
        loader.classList.add('d-none');
        verifyBtn.disabled = false;

        if (!student) {
            showResult('Student not found or course mismatch', 'danger');
            return;
        }

        // Check if fee is cleared
        const today = new Date();
        const validUntil = new Date(student.validUntil);
        const feePercentage = (student.feeAmount / TOTAL_FEE) * 100;
        
        if (today > validUntil) {
            showResult(`Gatepass expired. Please renew your fees. (${feePercentage.toFixed(2)}% paid)`, 'danger');
            return;
        }

        // Record attendance
        const attendance = JSON.parse(localStorage.getItem('attendance')) || [];
        attendance.push({
            date: today.toLocaleDateString(),
            time: today.toLocaleTimeString(),
            name: student.name,
            admissionNumber: student.admissionNumber,
            course: student.course,
            status: 'Present',
            feePercentage: feePercentage.toFixed(2)
        });
        localStorage.setItem('attendance', JSON.stringify(attendance));

        // Show success message with fee percentage
        showResult(`Gatepass verified successfully! (${feePercentage.toFixed(2)}% fee paid)`, 'success');

        // Clear form and reset after 5 seconds
        setTimeout(() => {
            verificationForm.reset();
            resultMessage.classList.add('d-none');
        }, 5000);
    }

    function showResult(message, type) {
        resultMessage.textContent = message;
        resultMessage.className = `alert alert-${type}`;
        resultMessage.classList.remove('d-none');
    }
});

// Theme handling
const themeToggle = document.createElement('button');
themeToggle.className = 'theme-toggle';
themeToggle.innerHTML = '🌓';
document.body.appendChild(themeToggle);

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Initialize theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

// Timer controls
let timerInterval;
let remainingTime = 0;
let isPaused = false;

function startTimer(duration) {
    remainingTime = duration;
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

function pauseTimer() {
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(timerInterval);
    } else {
        timerInterval = setInterval(updateTimer, 1000);
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    remainingTime = 0;
    updateTimer();
}

function updateTimer() {
    if (remainingTime <= 0) {
        clearInterval(timerInterval);
        showTimerExpired();
        return;
    }

    remainingTime--;
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    
    // Update progress bar
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = `${(remainingTime / totalDuration) * 100}%`;
    }
    
    // Add warning class when time is low
    if (remainingTime <= 30) {
        document.querySelector('.countdown-timer').classList.add('timer-warning');
    }
}

// Security features
let failedAttempts = 0;
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

function handleFailedAttempt() {
    failedAttempts++;
    if (failedAttempts >= MAX_ATTEMPTS) {
        showLockoutScreen();
        setTimeout(() => {
            failedAttempts = 0;
            hideLockoutScreen();
        }, LOCKOUT_DURATION);
    }
}

function showLockoutScreen() {
    const lockoutScreen = document.createElement('div');
    lockoutScreen.className = 'lock-screen';
    lockoutScreen.innerHTML = `
        <div class="lock-content">
            <h2>Too Many Attempts</h2>
            <p>Please wait 5 minutes before trying again.</p>
        </div>
    `;
    document.body.appendChild(lockoutScreen);
}

function hideLockoutScreen() {
    const lockoutScreen = document.querySelector('.lock-screen');
    if (lockoutScreen) {
        lockoutScreen.remove();
    }
}

// Network status monitoring
const networkStatus = document.createElement('div');
networkStatus.className = 'network-status';
document.body.appendChild(networkStatus);

window.addEventListener('online', () => {
    networkStatus.textContent = 'Online';
    networkStatus.className = 'network-status online';
    setTimeout(() => {
        networkStatus.className = 'network-status';
    }, 3000);
});

window.addEventListener('offline', () => {
    networkStatus.textContent = 'Offline';
    networkStatus.className = 'network-status offline';
});

// Add to Home Screen prompt
let deferredPrompt;
const addToHomeScreen = document.createElement('div');
addToHomeScreen.className = 'add-to-home';
addToHomeScreen.innerHTML = `
    <span>Add to Home Screen for better experience</span>
    <button class="btn btn-primary">Add</button>
`;
document.body.appendChild(addToHomeScreen);

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    addToHomeScreen.classList.add('visible');
});

addToHomeScreen.querySelector('button').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            addToHomeScreen.classList.remove('visible');
        }
        deferredPrompt = null;
    }
});

// Error handling
window.addEventListener('error', (event) => {
    console.error('Error:', event.error);
    showError('An unexpected error occurred. Please try again.');
});

function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'alert alert-danger error-state';
    errorElement.textContent = message;
    document.body.appendChild(errorElement);
    setTimeout(() => errorElement.remove(), 5000);
}

// Performance optimization
document.addEventListener('DOMContentLoaded', () => {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
});

// Mobile orientation handling
const orientationWarning = document.createElement('div');
orientationWarning.className = 'orientation-warning';
orientationWarning.innerHTML = `
    <div>
        <h3>Please rotate your device</h3>
        <p>This app works best in portrait mode</p>
    </div>
`;
document.body.appendChild(orientationWarning);

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Add touch feedback to buttons
    document.querySelectorAll('button').forEach(button => {
        button.classList.add('touch-feedback');
    });
});