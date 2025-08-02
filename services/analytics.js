// Analytics Service for HopeNocode Platform
class AnalyticsService {
    constructor() {
        this.events = [];
        this.metrics = {
            pageViews: 0,
            uniqueUsers: new Set(),
            totalRevenue: 0,
            successfulPayments: 0,
            failedPayments: 0,
            subscriptions: 0,
            activeUsers: new Set(),
            popularProducts: {},
            conversionRate: 0
        };
    }

    // Track page view
    trackPageView(page, userId = null) {
        const event = {
            type: 'page_view',
            page,
            userId,
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId()
        };
        
        this.events.push(event);
        this.metrics.pageViews++;
        
        if (userId) {
            this.metrics.uniqueUsers.add(userId);
            this.metrics.activeUsers.add(userId);
        }
    }

    // Track user action
    trackEvent(eventType, data = {}, userId = null) {
        const event = {
            type: eventType,
            data,
            userId,
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId()
        };
        
        this.events.push(event);
    }

    // Track payment
    trackPayment(amount, success, userId = null, productId = null) {
        const event = {
            type: 'payment',
            amount,
            success,
            userId,
            productId,
            timestamp: new Date().toISOString()
        };
        
        this.events.push(event);
        
        if (success) {
            this.metrics.totalRevenue += amount;
            this.metrics.successfulPayments++;
        } else {
            this.metrics.failedPayments++;
        }
    }

    // Track subscription
    trackSubscription(planId, userId, amount) {
        const event = {
            type: 'subscription',
            planId,
            userId,
            amount,
            timestamp: new Date().toISOString()
        };
        
        this.events.push(event);
        this.metrics.subscriptions++;
        this.metrics.totalRevenue += amount;
    }

    // Track product interaction
    trackProductInteraction(productId, action, userId = null) {
        if (!this.metrics.popularProducts[productId]) {
            this.metrics.popularProducts[productId] = {
                views: 0,
                purchases: 0,
                cartAdds: 0
            };
        }
        
        this.metrics.popularProducts[productId][action]++;
        
        this.trackEvent('product_interaction', {
            productId,
            action
        }, userId);
    }

    // Get analytics data
    getAnalytics() {
        const totalUsers = this.metrics.uniqueUsers.size;
        const activeUsers = this.metrics.activeUsers.size;
        
        return {
            overview: {
                totalPageViews: this.metrics.pageViews,
                uniqueUsers: totalUsers,
                activeUsers,
                totalRevenue: this.metrics.totalRevenue,
                successfulPayments: this.metrics.successfulPayments,
                failedPayments: this.metrics.failedPayments,
                subscriptions: this.metrics.subscriptions,
                conversionRate: totalUsers > 0 ? (this.metrics.successfulPayments / totalUsers * 100).toFixed(2) : 0
            },
            popularProducts: this.metrics.popularProducts,
            recentEvents: this.events.slice(-50), // Last 50 events
            revenueByDay: this.getRevenueByDay(),
            userGrowth: this.getUserGrowth()
        };
    }

    // Get revenue by day
    getRevenueByDay() {
        const revenueByDay = {};
        
        this.events
            .filter(event => event.type === 'payment' && event.success)
            .forEach(event => {
                const date = new Date(event.timestamp).toDateString();
                revenueByDay[date] = (revenueByDay[date] || 0) + event.amount;
            });
        
        return revenueByDay;
    }

    // Get user growth
    getUserGrowth() {
        const userGrowth = {};
        
        this.events
            .filter(event => event.userId)
            .forEach(event => {
                const date = new Date(event.timestamp).toDateString();
                if (!userGrowth[date]) {
                    userGrowth[date] = new Set();
                }
                userGrowth[date].add(event.userId);
            });
        
        return Object.fromEntries(
            Object.entries(userGrowth).map(([date, users]) => [date, users.size])
        );
    }

    // Get session ID
    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    }

    // Export analytics data
    exportData() {
        return {
            events: this.events,
            metrics: {
                ...this.metrics,
                uniqueUsers: Array.from(this.metrics.uniqueUsers),
                activeUsers: Array.from(this.metrics.activeUsers)
            }
        };
    }
}

module.exports = new AnalyticsService(); 