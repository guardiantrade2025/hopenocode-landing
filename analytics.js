// Frontend Analytics Service
class FrontendAnalytics {
    constructor() {
        this.baseUrl = window.location.origin;
        this.sessionId = this.generateSessionId();
        this.pageStartTime = Date.now();
        this.init();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    init() {
        // Track page view on load
        this.trackPageView();
        
        // Track time on page when user leaves
        window.addEventListener('beforeunload', () => {
            this.trackTimeOnPage();
        });

        // Track clicks on important elements
        this.trackClicks();
    }

    trackPageView() {
        const pageData = {
            url: window.location.href,
            title: document.title,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString()
        };

        fetch('/api/analytics/pageview', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pageData)
        }).catch(error => {
            console.log('Analytics tracking failed:', error);
        });
    }

    trackEvent(eventName, eventData = {}) {
        const eventPayload = {
            event: eventName,
            data: eventData,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };

        fetch('/api/analytics/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventPayload)
        }).catch(error => {
            console.log('Event tracking failed:', error);
        });
    }

    trackTimeOnPage() {
        const timeOnPage = Date.now() - this.pageStartTime;
        this.trackEvent('time_on_page', {
            duration: timeOnPage,
            page: window.location.pathname
        });
    }

    trackClicks() {
        // Track clicks on buttons, links, and forms
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.tagName === 'INPUT') {
                this.trackEvent('click', {
                    element: target.tagName.toLowerCase(),
                    text: target.textContent || target.value || '',
                    id: target.id || '',
                    className: target.className || ''
                });
            }
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            this.trackEvent('form_submit', {
                formId: e.target.id || '',
                formAction: e.target.action || ''
            });
        });
    }

    trackPayment(amount, currency = 'USD', productId = null) {
        this.trackEvent('payment', {
            amount: amount,
            currency: currency,
            productId: productId
        });
    }

    trackSubscription(planId, amount, currency = 'USD') {
        this.trackEvent('subscription', {
            planId: planId,
            amount: amount,
            currency: currency
        });
    }
}

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.analytics = new FrontendAnalytics();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FrontendAnalytics;
} 