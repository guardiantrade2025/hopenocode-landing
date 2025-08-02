require('dotenv').config({ path: './config.env' });
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');
const rateLimit = require('express-rate-limit');
const { authenticateToken, generateToken, registerUser, loginUser } = require('./middleware/auth');
const analytics = require('./services/analytics');
const aiService = require('./services/ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use('/api/', limiter);

// Sample data storage (in production, use a database)
let orders = [];
let subscriptions = [];
let customers = [];

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const user = registerUser({ email, password, name });
        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = loginUser(email, password);
        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// Protected route example
app.get('/api/auth/profile', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// Analytics Routes
app.get('/api/analytics', authenticateToken, (req, res) => {
    try {
        const analyticsData = analytics.getAnalytics();
        res.json(analyticsData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/analytics/track', (req, res) => {
    try {
        const { eventType, data, userId } = req.body;
        analytics.trackEvent(eventType, data, userId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/analytics/pageview', (req, res) => {
    try {
        const { page, userId } = req.body;
        analytics.trackPageView(page, userId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// AI Routes
app.post('/api/ai/generate-code', async (req, res) => {
    try {
        const { description, language, template } = req.body;
        const result = await aiService.generateCode(description, language, template);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, conversationId } = req.body;
        const result = await aiService.chat(message, conversationId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/ai/templates', (req, res) => {
    try {
        const templates = aiService.getTemplates();
        res.json(templates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/ai/conversation/:id', (req, res) => {
    try {
        const { id } = req.params;
        const conversation = aiService.getConversation(id);
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/ai/conversation/:id', (req, res) => {
    try {
        const { id } = req.params;
        const result = aiService.clearConversation(id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Get all products
app.get('/api/products', (req, res) => {
    const products = [
        {
            id: 1,
            name: "AI Website Builder Pro",
            description: "Advanced AI-powered website builder with drag-and-drop functionality",
            price: 99.99,
            category: "templates",
            image: "🚀",
            popularity: 95
        },
        {
            id: 2,
            name: "E-commerce Component Pack",
            description: "Complete set of e-commerce components for your projects",
            price: 49.99,
            category: "components",
            image: "🛒",
            popularity: 87
        },
        {
            id: 3,
            name: "Analytics Dashboard Plugin",
            description: "Real-time analytics and reporting dashboard plugin",
            price: 29.99,
            category: "plugins",
            image: "📊",
            popularity: 92
        },
        {
            id: 4,
            name: "React Masterclass Course",
            description: "Complete React development course with hands-on projects",
            price: 199.99,
            category: "courses",
            image: "📚",
            popularity: 89
        },
        {
            id: 5,
            name: "UI/UX Design System",
            description: "Comprehensive design system with 100+ components",
            price: 79.99,
            category: "components",
            image: "🎨",
            popularity: 94
        },
        {
            id: 6,
            name: "API Integration Toolkit",
            description: "Complete toolkit for integrating third-party APIs",
            price: 149.99,
            category: "plugins",
            image: "🔌",
            popularity: 91
        }
    ];
    res.json(products);
});

// Get subscription plans
app.get('/api/plans', (req, res) => {
    const plans = [
        {
            id: 'starter',
            name: 'Starter',
            price: 9.99,
            features: [
                '5 projects',
                'Basic AI assistance',
                'Email support',
                '1GB storage',
                'Community access'
            ]
        },
        {
            id: 'pro',
            name: 'Pro',
            price: 29.99,
            features: [
                'Unlimited projects',
                'Advanced AI features',
                'Priority support',
                '10GB storage',
                'Custom domains',
                'Analytics dashboard',
                'Team collaboration'
            ]
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 99.99,
            features: [
                'Everything in Pro',
                'Unlimited storage',
                'Dedicated support',
                'Custom integrations',
                'White-label options',
                'Advanced security',
                'SLA guarantee',
                'Onboarding support'
            ]
        }
    ];
    res.json(plans);
});

// Create payment intent for one-time purchases
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd', items } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            metadata: {
                items: JSON.stringify(items)
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create subscription
app.post('/api/create-subscription', async (req, res) => {
    try {
        const { email, paymentMethodId, planId, customerData } = req.body;

        // Create or get customer
        let customer = customers.find(c => c.email === email);
        if (!customer) {
            customer = {
                id: 'cust_' + Date.now(),
                email,
                name: customerData.name,
                created: new Date().toISOString()
            };
            customers.push(customer);
        }

        // Create subscription in Stripe
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: getStripePriceId(planId) }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
            metadata: {
                planId,
                customerEmail: email
            }
        });

        // Store subscription locally
        const localSubscription = {
            id: subscription.id,
            customerId: customer.id,
            planId,
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            created: new Date().toISOString()
        };
        subscriptions.push(localSubscription);

        res.json({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice.payment_intent.client_secret
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get customer orders
app.get('/api/customer/:email/orders', (req, res) => {
    const { email } = req.params;
    const customerOrders = orders.filter(order => order.customerEmail === email);
    res.json(customerOrders);
});

// Get customer subscriptions
app.get('/api/customer/:email/subscriptions', (req, res) => {
    const { email } = req.params;
    const customer = customers.find(c => c.email === email);
    if (!customer) {
        return res.json([]);
    }
    const customerSubscriptions = subscriptions.filter(sub => sub.customerId === customer.id);
    res.json(customerSubscriptions);
});

// Create order
app.post('/api/orders', async (req, res) => {
    try {
        const { customerEmail, items, total, paymentIntentId } = req.body;

        const order = {
            id: 'ORD-' + Date.now(),
            customerEmail,
            items,
            total,
            status: 'completed',
            paymentIntentId,
            created: new Date().toISOString()
        };

        orders.push(order);
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cancel subscription
app.post('/api/subscriptions/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Cancel in Stripe
        await stripe.subscriptions.update(id, {
            cancel_at_period_end: true
        });

        // Update local subscription
        const subscription = subscriptions.find(s => s.id === id);
        if (subscription) {
            subscription.status = 'canceled';
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Webhook for Stripe events
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = 'whsec_your_webhook_secret';

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('PaymentIntent was successful!');
            break;
        case 'invoice.payment_succeeded':
            const invoice = event.data.object;
            console.log('Invoice payment succeeded!');
            break;
        case 'customer.subscription.deleted':
            const subscription = event.data.object;
            console.log('Subscription was deleted!');
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

// Helper function to get Stripe price IDs
function getStripePriceId(planId) {
    const priceIds = {
        'starter': 'price_starter_monthly',
        'pro': 'price_pro_monthly',
        'enterprise': 'price_enterprise_monthly'
    };
    return priceIds[planId] || 'price_pro_monthly';
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 HopeNocode server running on port ${PORT}`);
    console.log(`📱 Store: http://localhost:${PORT}/store.html`);
    console.log(`🔄 Subscriptions: http://localhost:${PORT}/subscriptions.html`);
    console.log(`👤 Portal: http://localhost:${PORT}/portal.html`);
    console.log(`💬 Chat: http://localhost:${PORT}/chat.html`);
    console.log(`🎨 Builder: http://localhost:${PORT}/builder.html`);
    console.log(`📊 Analytics: http://localhost:${PORT}/analytics.html`);
    console.log(`🎮 Playground: http://localhost:${PORT}/playground.html`);
});

module.exports = app; 