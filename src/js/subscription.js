// Cached DOM elements
let subscribeIconElement;
let subscribeFormElement;
let subscribeEmailInputElement;
let subscribeContainerElement;

// Subscription management

function initializeSubscriptionState() {
    subscribeIconElement = document.getElementById('icon-subscribe');
    subscribeFormElement = document.getElementById('subscribe-form');
    subscribeEmailInputElement = document.getElementById('subscribe-email');
    subscribeContainerElement = document.querySelector('.subscribe-container');

    if (!subscribeIconElement) {
        console.error('Subscribe icon (icon-subscribe) not found. Subscription features may not work.');
        return;
    }
    if (!subscribeContainerElement) {
        console.error('Subscribe container (.subscribe-container) not found. Form may not hide correctly on outside click.');
    }
    
    updateSubscribeIcon(isSubscribed());
}

function subscribeToNewsletter(event) {
    if (event) event.preventDefault();
    
    if (isSubscribed()) {
        unsubscribe();
        return;
    }
    
    if (!subscribeEmailInputElement || !subscribeEmailInputElement.value) {
        showToast("Please enter a valid email address", false);
        return;
    }
    
    const email = subscribeEmailInputElement.value.trim();
    if (!validateEmail(email)) {
        showToast("Please enter a valid email address", false);
        return;
    }
    
    subscribe(email);
    if (subscribeEmailInputElement) subscribeEmailInputElement.value = '';
}

// Subscription icon

function updateSubscribeIcon(subscribed) {
    if (!subscribeIconElement) return;
    subscribeIconElement.className = subscribed ? 'bi bi-bell-slash' : 'bi bi-bell';
}

// Subscription form

function toggleSubscribeForm() {
    if (isSubscribed()) {
        unsubscribe();
        return;
    }
    
    if (!subscribeFormElement) {
        console.error('Subscribe form (subscribe-form) not found.');
        return;
    }
    
    if (subscribeFormElement.classList.contains('hidden')) {
        showForm();
    } else {
        hideForm();
    }
}

function showForm() {
    if (!subscribeFormElement) return;
    
    subscribeFormElement.classList.remove('hidden');
    subscribeFormElement.classList.add('form-appear');
    
    if (subscribeEmailInputElement) subscribeEmailInputElement.focus();
    document.addEventListener('click', handleOutsideClick);
}

function hideForm() {
    if (!subscribeFormElement || subscribeFormElement.classList.contains('hidden')) return;
    
    subscribeFormElement.classList.add('form-disappear');
    document.removeEventListener('click', handleOutsideClick);
    
    setTimeout(() => {
        if (subscribeFormElement && subscribeFormElement.classList.contains('form-disappear')) {
            subscribeFormElement.classList.add('hidden');
            subscribeFormElement.classList.remove('form-appear', 'form-disappear');
        }
    }, 300);
}

function handleOutsideClick(event) {
    if (subscribeFormElement && !subscribeFormElement.classList.contains('hidden') && 
        subscribeContainerElement &&
        !subscribeFormElement.contains(event.target) && 
        !subscribeContainerElement.contains(event.target)) {
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
    if (isOnCooldown()) return;
    if (!subscribeIconElement) {
        showToast("Subscription UI element not found.", false);
        return;
    }
    
    localStorage.setItem('subscriber-email', email);
    localStorage.setItem('newsletter-subscribed', 'true');
    
    updateSubscribeIcon(true);
    showToast("Successfully subscribed", true);
    hideForm();
}

function unsubscribe() {
    if (isOnCooldown()) return;
    if (!subscribeIconElement) {
        showToast("Subscription UI element not found.", false);
        return;
    }
    
    localStorage.setItem('newsletter-subscribed', 'false');
    localStorage.removeItem('subscriber-email');
    
    updateSubscribeIcon(false);
    showToast("Successfully unsubscribed", true);
}

// Toast notifications

function showToast(text, isSuccess) {
    if (typeof Toastify !== 'function') {
        console.error('Toastify library is not loaded. Displaying alert instead.');
        alert((isSuccess ? "✅ " : "❌ ") + (text || (isSuccess ? 'Operation successful' : 'An error occurred')));
        return;
    }

    const defaultText = isSuccess ? 'Operation successful' : 'An error occurred';
    const message = text || defaultText;
    
    const prefix = isSuccess ? "✅ " : "❌ ";
    const background = isSuccess 
        ? "linear-gradient(to right, #00b09b, #96c93d)"
        : "linear-gradient(to right, #FF0000, #FF7F50)";
    
    Toastify({
        text: prefix + message,
        duration: 3000,
        close: true,
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        style: { background },
    }).showToast();
}

document.addEventListener('DOMContentLoaded', initializeSubscriptionState);