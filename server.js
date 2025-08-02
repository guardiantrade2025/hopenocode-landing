const express = require('express');
const cors = require('cors');
const stripe = require('stripe')('sk_test_51H1234567890abcdefghijklmnopqrstuvwxyz');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Sample data storage (in production, use a database)
let orders = [];
let subscriptions = [];
let customers = [];

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