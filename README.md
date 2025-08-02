# HopeNocode - AI-Powered Development Platform with E-commerce

A comprehensive AI-powered development platform with full e-commerce capabilities, Stripe payment integration, and customer management.

## 🚀 Features

### E-commerce & Payment Integration
- **🛒 Product Store** - Complete product catalog with advanced filtering
- **💳 Stripe Payment Integration** - Secure payment processing for one-time purchases
- **🔄 Subscription Management** - Recurring billing with Stripe subscriptions
- **👤 Customer Portal** - Order history, subscription management, and account settings
- **📦 Shopping Cart** - Persistent cart with localStorage
- **📊 Order Management** - Complete order tracking and management system

### AI Development Platform
- **🤖 AI Code Generation** - Generate code from natural language descriptions
- **🎨 Visual Builder** - Drag-and-drop website builder
- **💬 AI Chat Interface** - Interactive AI assistant
- **📈 Analytics Dashboard** - Real-time platform analytics
- **🎮 Code Playground** - Interactive development environment

### Modern UI/UX
- **🌙 Dark/Light Mode** - Toggle between themes
- **📱 Responsive Design** - Works perfectly on all devices
- **✨ Smooth Animations** - Professional user experience
- **🎨 Glass-morphism Effects** - Modern visual design
- **⚡ Fast Performance** - Optimized loading and interactions

## 🛠️ Technologies Used

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients and animations
- **JavaScript** - Interactive features and API integration
- **Stripe.js** - Payment processing

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Stripe API** - Payment processing
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
my-new-project/
├── index.html          # Main landing page
├── store.html          # E-commerce store
├── subscriptions.html  # Subscription management
├── portal.html         # Customer portal
├── dashboard.html      # Admin dashboard
├── builder.html        # Visual builder
├── chat.html          # AI chat interface
├── analytics.html     # Analytics dashboard
├── playground.html    # Code playground
├── contact.html       # Contact page
├── auth.html          # Authentication
├── server.js          # Backend API server
├── package.json       # Dependencies
└── README.md          # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Stripe account (for payment processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hopenocode/ecommerce-platform.git
   cd my-new-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   PORT=3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 💳 Payment Integration

### Stripe Setup
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe dashboard
3. Update the Stripe keys in `server.js` and frontend files
4. Set up webhook endpoints for subscription events

### Test Cards
Use these test card numbers for development:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

## 🛒 E-commerce Features

### Product Store (`store.html`)
- **Advanced Filtering** - Filter by category, price range, and popularity
- **Search Functionality** - Real-time product search
- **Shopping Cart** - Add/remove items with quantity management
- **Checkout Process** - Secure payment with Stripe integration
- **Responsive Design** - Mobile-friendly interface

### Subscription Management (`subscriptions.html`)
- **Plan Selection** - Choose from Starter, Pro, and Enterprise plans
- **Secure Billing** - Stripe subscription integration
- **Plan Features** - Detailed feature comparison
- **Billing Management** - Cancel or modify subscriptions

### Customer Portal (`portal.html`)
- **Order History** - Complete order tracking
- **Subscription Status** - Active and cancelled subscriptions
- **Download Management** - Access purchased products
- **Account Settings** - Update personal and billing information
- **Support Access** - Contact support and view documentation

## 🔧 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/plans` - Get subscription plans

### Payments
- `POST /api/create-payment-intent` - Create payment intent for one-time purchases
- `POST /api/create-subscription` - Create subscription
- `POST /api/orders` - Create order

### Customer Data
- `GET /api/customer/:email/orders` - Get customer orders
- `GET /api/customer/:email/subscriptions` - Get customer subscriptions
- `POST /api/subscriptions/:id/cancel` - Cancel subscription

### Webhooks
- `POST /api/webhook` - Stripe webhook handler

## 🎨 Customization

### Styling
- Modify CSS variables in each HTML file for custom colors
- Update gradients and animations in the style sections
- Customize glass-morphism effects and backdrop blur

### Content
- Update product data in `server.js` API endpoints
- Modify subscription plans and pricing
- Customize feature descriptions and benefits

### Integration
- Replace Stripe test keys with production keys
- Set up proper webhook endpoints
- Configure database for production use

## 🔒 Security Considerations

- **HTTPS** - Always use HTTPS in production
- **API Keys** - Never expose Stripe secret keys in frontend code
- **Input Validation** - Validate all user inputs
- **CORS** - Configure CORS properly for production
- **Rate Limiting** - Implement rate limiting for API endpoints

## 📊 Analytics & Monitoring

### Built-in Analytics
- User engagement tracking
- Payment success rates
- Subscription metrics
- Platform performance monitoring

### Integration Options
- Google Analytics
- Mixpanel
- Amplitude
- Custom analytics solutions

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
1. Set up environment variables
2. Install production dependencies
3. Start the server:
   ```bash
   npm start
   ```

### Deployment Platforms
- **Heroku** - Easy deployment with Git integration
- **Vercel** - Serverless deployment
- **AWS** - Scalable cloud infrastructure
- **DigitalOcean** - VPS deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.hopenocode.com](https://docs.hopenocode.com)
- **Issues**: [GitHub Issues](https://github.com/hopenocode/ecommerce-platform/issues)
- **Email**: support@hopenocode.com
- **Discord**: [Join our community](https://discord.gg/hopenocode)

---

Built with ❤️ by the HopeNocode Team

**Transform your ideas into reality with AI-powered development and seamless e-commerce integration!** 