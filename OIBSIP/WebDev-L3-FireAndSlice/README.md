# FIRE & SLICE - Pizza Delivery Platform

A production-grade, full-stack pizza ordering and inventory management platform with separate Admin and User roles, real-time order tracking, Razorpay payment integration, and automated stock notifications.

## Features

### User Side
- ✅ User registration with email verification
- ✅ User login with JWT-based authorization
- ✅ Forgot password flow (email reset link)
- ✅ Dashboard displaying available pizza varieties
- ✅ Custom pizza builder flow:
  - Step 1: Choose a pizza base (5 options)
  - Step 2: Choose a sauce (5 options)
  - Step 3: Choose a cheese type (4 options)
  - Step 4: Choose vegetables (multiple select from 8 options)
- ✅ Order summary page before payment
- ✅ Razorpay checkout integration (test mode)
- ✅ Real-time order status display on user dashboard (Order Received → In Kitchen → Sent to Delivery)

### Admin Side
- ✅ Separate admin login (not accessible from user registration)
- ✅ Inventory dashboard showing current stock of: pizza bases, sauces, cheeses, vegetables
- ✅ Stock automatically decremented after each order
- ✅ Manual stock update capability for each inventory item
- ✅ Automated email notification to admin when inventory falls below threshold (node-cron scheduled job)
- ✅ Order management panel: view all incoming orders, update status for each order
- ✅ Status change reflected in real-time on user's dashboard (polling every 30s)

## Tech Stack

**Frontend:**
- React 19 + Vite
- React Router v7
- Tailwind CSS v4
- Zustand (state management)
- Framer Motion (animations)
- Lucide React (icons)
- Axios (API client)

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Razorpay (payments)
- Nodemailer (emails)
- node-cron (scheduled jobs)
- bcryptjs (password hashing)

## Project Structure

```
OIBSIP/WebDev-L3-FireAndSlice/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── auth/       # Authentication pages
│   │   │   ├── pizza/      # Pizza menu & builder
│   │   │   ├── order/      # Checkout & payment
│   │   │   ├── dashboard/  # User dashboard
│   │   │   ├── admin/      # Admin dashboard
│   │   │   └── ui/         # Reusable UI components
│   │   ├── context/        # React contexts (Auth, Toast)
│   │   ├── hooks/          # Custom hooks
│   │   ├── store/          # Zustand stores
│   │   ├── services/       # API services
│   │   ├── utils/          # Helper functions
│   │   ├── App.jsx         # Main app with routing
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── index.js        # Entry point
│   │   └── seed.js         # Database seeder
│   ├── package.json
│   └── .env.example
└── package.json            # Root package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Razorpay account (for payments)
- Gmail account (for emails)

### Installation

1. **Clone and install dependencies:**
```bash
cd OIBSIP/WebDev-L3-FireAndSlice

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

2. **Configure environment variables:**
```bash
# In server directory
cp .env.example .env
# Edit .env with your configuration
```

Required environment variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fireandslice
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=http://localhost:5173

# Razorpay (test mode)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your-secret

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

3. **Seed the database:**
```bash
cd server
npm run seed
```

4. **Start development servers:**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

5. **Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Admin login: http://localhost:5173/admin/login

## Default Admin Credentials
After running seed:
- Username: `admin`
- Password: `admin123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `GET /api/auth/verify-email?token=` - Verify email
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user

### Pizza Menu
- `GET /api/pizzas/menu` - Get all pizza options
- `GET /api/inventory/category/:category` - Get available items by category

### Orders
- `POST /api/orders/create-order` - Create Razorpay order
- `POST /api/orders/verify-payment` - Verify payment & create order
- `GET /api/orders/user` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `GET /api/orders` - Get all orders (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Inventory (Admin)
- `GET /api/inventory` - Get all inventory
- `POST /api/inventory` - Create inventory item
- `PUT /api/inventory/:id` - Update inventory stock
- `DELETE /api/inventory/:id` - Delete inventory item

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/me` - Get admin profile

## Design System

The application uses a custom design system with:
- **Primary Color:** `#ea580c` (Fiery Orange)
- **Font:** Inter
- **Border Radius:** 12px (rounded-xl) for cards, 16px (rounded-2xl) for containers
- **Spacing:** 4px base unit
- **Shadows:** Layered elevation system

## Deployment

### Backend (Railway/Render/Heroku)
1. Set environment variables
2. Build: `npm run build` (if applicable)
3. Start: `npm start`

### Frontend (Vercel/Netlify)
1. Build command: `npm run build`
2. Output directory: `dist`
3. Set API URL environment variable

## License

MIT License - Built for Oasis Infobyte Internship Program (OIBSIP)