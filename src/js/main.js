document.addEventListener('DOMContentLoaded', initializeSubscriptionState);


// Subscription management

function initializeSubscriptionState() {
    const icon = getSubscribeIcon();
    if (!icon) return;
    
    const subscribed = isSubscribed();
    updateSubscribeIcon(subscribed);
    
    document.addEventListener('click', handleOutsideClick);
}

function subscribeToNewsletter(event) {
    if (event) event.preventDefault();
    
    if (isOnCooldown()) return;
    
    if (isSubscribed()) {
        unsubscribe();
        return;
    }
    
    const emailInput = document.getElementById('subscribe-email');
    if (!emailInput || !emailInput.value) {
        showToast("Please enter a valid email address", false);
        return;
    }
    
    const email = emailInput.value.trim();
    if (!validateEmail(email)) {
        showToast("Please enter a valid email address", false);
        return;
    }
    
    subscribe(email);
    emailInput.value = '';
}

// Subscription icon

function getSubscribeIcon() {
    const icon = document.getElementById('icon-subscribe');
    if (!icon) console.error('Subscribe icon element not found');
    return icon;
}

function updateSubscribeIcon(subscribed) {
    const icon = getSubscribeIcon();
    if (!icon) return;
    
    icon.className = 'bi';
    icon.classList.add(subscribed ? 'bi-bell-slash' : 'bi-bell');
}

// Subscription form

function toggleSubscribeForm() {
    if (isSubscribed()) {
        unsubscribe();
        return;
    }
    
    const form = document.getElementById('subscribe-form');
    if (!form) return;
    
    if (form.classList.contains('hidden')) {
        showForm();
    } else {
        hideForm();
    }
}

function showForm() {
    const form = document.getElementById('subscribe-form');
    if (!form) return;
    
    form.classList.remove('hidden');
    form.classList.add('form-appear');
    
    const emailInput = document.getElementById('subscribe-email');
    if (emailInput) emailInput.focus();
}

function hideForm() {
    const form = document.getElementById('subscribe-form');
    if (!form || form.classList.contains('hidden')) return;
    
    form.classList.add('form-disappear');
    
    setTimeout(() => {
        form.classList.add('hidden');
        form.classList.remove('form-appear', 'form-disappear');
    }, 300);
}

function handleOutsideClick(event) {
    const form = document.getElementById('subscribe-form');
    const container = document.querySelector('.subscribe-container');
    
    if (form && !form.classList.contains('hidden') && 
        !form.contains(event.target) && 
        !container.contains(event.target)) {
        hideForm();
    }
}

// Cooldown and validation

function isSubscribed() {
    return localStorage.getItem('newsletter-subscribed') === 'true';
}

function isOnCooldown() {
    const lastActionTime = localStorage.getItem('newsletter-action-timestamp');
    const currentTime = Date.now();
    const cooldownPeriod = 2000;
    
    if (lastActionTime && (currentTime - parseInt(lastActionTime)) < cooldownPeriod) {
        showToast("Please wait a moment before trying again.", false);
        return true;
    }
    
    localStorage.setItem('newsletter-action-timestamp', currentTime.toString());
    return false;
}

function validateEmail(email) {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}


// Subscription logic

function subscribe(email) {
    const icon = getSubscribeIcon();
    if (!icon) {
        showToast("Couldn't find subscription button", false);
        return;
    }
    
    localStorage.setItem('subscriber-email', email);
    localStorage.setItem('newsletter-subscribed', 'true');
    
    updateSubscribeIcon(true);
    showToast("Successfully subscribed", true);
    hideForm();
}

function unsubscribe() {
    const icon = getSubscribeIcon();
    if (!icon) {
        showToast("Couldn't find subscription button", false);
        return;
    }
    
    localStorage.setItem('newsletter-subscribed', 'false');
    localStorage.removeItem('subscriber-email');
    
    updateSubscribeIcon(false);
    showToast("Successfully unsubscribed", true);
}

// Toast notifications

function showToast(text, isSuccess) {
    if (!text) text = isSuccess ? 'Operation successful' : 'An error occurred';
    
    const prefix = isSuccess ? "✅ " : "❌ ";
    const background = isSuccess 
        ? "linear-gradient(to right, #00b09b, #96c93d)"
        : "linear-gradient(to right, #FF0000, #FF7F50)";
    
    Toastify({
        text: prefix + text,
        duration: 3000,
        close: true,
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        style: { background },
    }).showToast();
}