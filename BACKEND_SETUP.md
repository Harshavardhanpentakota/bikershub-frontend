# BikersHub — Node.js + Express Backend Setup Guide

This document covers everything needed to replace the `mockData.ts` stubs with a real Node/Express REST API that the existing React frontend can consume.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Prerequisites](#2-prerequisites)
3. [Bootstrap the Server](#3-bootstrap-the-server)
4. [Environment Variables](#4-environment-variables)
5. [Database Schema (MongoDB / Mongoose)](#5-database-schema-mongodb--mongoose)
6. [API Routes Reference](#6-api-routes-reference)
7. [Auth — JWT Middleware](#7-auth--jwt-middleware)
8. [File / Image Uploads (Cloudinary)](#8-file--image-uploads-cloudinary)
9. [Payment Integration (Razorpay)](#9-payment-integration-razorpay)
10. [Connecting the Frontend](#10-connecting-the-frontend)
11. [CORS Configuration](#11-cors-configuration)
12. [Scripts & Running](#12-scripts--running)
13. [Deployment Checklist](#13-deployment-checklist)

---

## 1. Project Structure

```
bikershub-backend/
├── src/
│   ├── config/
│   │   ├── db.ts            # Mongoose connection
│   │   └── cloudinary.ts    # Cloudinary SDK init
│   ├── middleware/
│   │   ├── auth.ts          # JWT verify
│   │   ├── errorHandler.ts  # Global error handler
│   │   └── upload.ts        # Multer + Cloudinary storage
│   ├── models/
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   ├── Cart.ts
│   │   └── Review.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   ├── cart.ts
│   │   ├── orders.ts
│   │   ├── users.ts
│   │   ├── reviews.ts
│   │   └── payment.ts
│   ├── controllers/         # (one file per route group)
│   └── index.ts             # Entry point
├── .env
├── package.json
└── tsconfig.json
```

---

## 2. Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 20 LTS |
| npm / pnpm | ≥ 9 |
| MongoDB | Atlas free tier or local 7.x |
| Razorpay account | For payment integration |
| Cloudinary account | For product image hosting |

---

## 3. Bootstrap the Server

```bash
mkdir bikershub-backend && cd bikershub-backend
npm init -y

# Core dependencies
npm install express mongoose dotenv cors helmet morgan bcryptjs jsonwebtoken
npm install multer cloudinary multer-storage-cloudinary
npm install razorpay crypto

# Dev dependencies
npm install -D typescript ts-node-dev @types/express @types/node @types/cors \
  @types/bcryptjs @types/jsonwebtoken @types/multer
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
```

### `src/index.ts`

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';

import authRoutes     from './routes/auth';
import productRoutes  from './routes/products';
import cartRoutes     from './routes/cart';
import orderRoutes    from './routes/orders';
import userRoutes     from './routes/users';
import reviewRoutes   from './routes/reviews';
import paymentRoutes  from './routes/payment';

dotenv.config();
connectDB();

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart',     cartRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/reviews',  reviewRoutes);
app.use('/api/payment',  paymentRoutes);

app.use(errorHandler);

const PORT = process.env.PORT ?? 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
```

### `src/config/db.ts`

```typescript
import mongoose from 'mongoose';

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}
```

---

## 4. Environment Variables

Create `.env` in the backend root:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/bikershub?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# Frontend origin (Vite dev server)
FRONTEND_URL=http://localhost:8080

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

---

## 5. Database Schema (MongoDB / Mongoose)

### `src/models/User.ts`

```typescript
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  addresses: {
    id: string; name: string; street: string;
    city: string; state: string; zip: string;
    phone: string; isDefault: boolean;
  }[];
  wishlist: mongoose.Types.ObjectId[];
  role: 'customer' | 'admin';
  comparePassword(plain: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name:      { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true },
    password:  { type: String, required: true, minlength: 6 },
    phone:     String,
    addresses: [
      {
        name: String, street: String, city: String,
        state: String, zip: String, phone: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
    wishlist:  [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    role:      { type: String, enum: ['customer', 'admin'], default: 'customer' },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
```

### `src/models/Product.ts`

```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  category: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  badge?: 'new' | 'bestseller' | 'discount';
  compatibleBikes: string[];
  description: string;
  specifications: Map<string, string>;
  inStock: boolean;
  stockQuantity: number;
}

const ProductSchema = new Schema<IProduct>(
  {
    name:           { type: String, required: true, trim: true },
    price:          { type: Number, required: true, min: 0 },
    originalPrice:  Number,
    discount:       Number,
    rating:         { type: Number, default: 0, min: 0, max: 5 },
    reviewCount:    { type: Number, default: 0 },
    image:          { type: String, required: true },
    images:         [String],
    category:       { type: String, required: true, index: true },
    sizes:          [String],
    colors:         [{ name: String, hex: String }],
    badge:          { type: String, enum: ['new', 'bestseller', 'discount'] },
    compatibleBikes:[String],
    description:    String,
    specifications: { type: Map, of: String },
    inStock:        { type: Boolean, default: true },
    stockQuantity:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Full-text search index
ProductSchema.index({ name: 'text', description: 'text', category: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);
```

### `src/models/Order.ts`

```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    name: string;
    image: string;
    price: number;
    quantity: number;
    selectedSize: string;
    selectedColor: string;
  }[];
  shippingAddress: {
    name: string; street: string; city: string;
    state: string; zip: string; phone: string;
  };
  shippingMethod: 'standard' | 'express';
  paymentMethod: 'cod' | 'razorpay' | 'upi';
  paymentStatus: 'pending' | 'paid' | 'failed';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingId?: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    user:            { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
      product:       { type: Schema.Types.ObjectId, ref: 'Product' },
      name: String, image: String, price: Number,
      quantity: Number, selectedSize: String, selectedColor: String,
    }],
    shippingAddress: {
      name: String, street: String, city: String,
      state: String, zip: String, phone: String,
    },
    shippingMethod:  { type: String, enum: ['standard', 'express'], default: 'standard' },
    paymentMethod:   { type: String, enum: ['cod', 'razorpay', 'upi'], default: 'cod' },
    paymentStatus:   { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    subtotal:        Number,
    shippingCost:    Number,
    total:           { type: Number, required: true },
    status:          { type: String, enum: ['processing', 'shipped', 'delivered', 'cancelled'], default: 'processing' },
    trackingId:      String,
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
```

### `src/models/Review.ts`

```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  userName: string;
  rating: number;
  comment: string;
  verified: boolean;
}

const ReviewSchema = new Schema<IReview>(
  {
    product:  { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user:     { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    userName: String,
    rating:   { type: Number, required: true, min: 1, max: 5 },
    comment:  { type: String, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One review per user per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', ReviewSchema);
```

---

## 6. API Routes Reference

### Auth — `/api/auth`

| Method | Endpoint | Body | Auth | Description |
|--------|----------|------|------|-------------|
| POST | `/register` | `{ name, email, password }` | — | Register new user |
| POST | `/login` | `{ email, password }` | — | Login, returns JWT |
| POST | `/logout` | — | ✅ | Invalidate token (client-side) |
| POST | `/forgot-password` | `{ email }` | — | Send reset email |
| POST | `/reset-password` | `{ token, password }` | — | Reset password |

```typescript
// src/routes/auth.ts  (abbreviated)
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already registered' });

  const user = await User.create({ name, email, password });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

export default router;
```

---

### Products — `/api/products`

| Method | Endpoint | Query / Body | Auth | Description |
|--------|----------|-------------|------|-------------|
| GET | `/` | `?category=&brand=&model=&search=&page=&limit=` | — | List products with filters |
| GET | `/:id` | — | — | Single product |
| POST | `/` | FormData (product fields + images) | Admin | Create product |
| PUT | `/:id` | FormData | Admin | Update product |
| DELETE | `/:id` | — | Admin | Delete product |

```typescript
// src/routes/products.ts  (abbreviated)
import { Router } from 'express';
import Product from '../models/Product';
import { protect, adminOnly } from '../middleware/auth';
import { uploadImages } from '../middleware/upload';

const router = Router();

router.get('/', async (req, res) => {
  const { category, brand, model, search, page = 1, limit = 20 } = req.query;
  const query: Record<string, unknown> = {};

  if (category) query.category = category;
  if (search)   query.$text = { $search: search as string };

  if (brand && model) {
    const key = `${brand} ${model}`;
    query.compatibleBikes = { $in: ['All', key] };
  } else if (brand) {
    // match any model from that brand
    query.compatibleBikes = { $elemMatch: { $regex: `^${brand}`, $options: 'i' } };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(query).skip(skip).limit(Number(limit)),
    Product.countDocuments(query),
  ]);

  res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

router.post('/', protect, adminOnly, uploadImages, async (req, res) => {
  const files = req.files as Express.Multer.File[];
  const images = files.map(f => (f as any).path); // Cloudinary URL
  const product = await Product.create({ ...req.body, image: images[0], images });
  res.status(201).json(product);
});

export default router;
```

---

### Cart — `/api/cart`

| Method | Endpoint | Body | Auth | Description |
|--------|----------|------|------|-------------|
| GET | `/` | — | ✅ | Get user's cart |
| POST | `/add` | `{ productId, quantity, selectedSize, selectedColor }` | ✅ | Add item |
| PUT | `/update` | `{ productId, quantity }` | ✅ | Update quantity |
| DELETE | `/remove/:productId` | — | ✅ | Remove item |
| DELETE | `/clear` | — | ✅ | Clear cart |

> **Note:** The current `CartContext.tsx` manages state in memory. To persist cart to backend, replace the context's state mutations with `fetch` / `axios` calls to these endpoints and store the JWT in `localStorage`.

---

### Orders — `/api/orders`

| Method | Endpoint | Body | Auth | Description |
|--------|----------|------|------|-------------|
| POST | `/` | `{ items, shippingAddress, shippingMethod, paymentMethod }` | ✅ | Place order |
| GET | `/my` | — | ✅ | User's order history |
| GET | `/:id` | — | ✅ | Single order detail |
| PUT | `/:id/cancel` | — | ✅ | Cancel order |
| GET | `/` | `?status=&page=` | Admin | All orders |
| PUT | `/:id/status` | `{ status, trackingId }` | Admin | Update order status |

```typescript
// src/routes/orders.ts  (abbreviated)
router.post('/', protect, async (req, res) => {
  const { items, shippingAddress, shippingMethod, paymentMethod } = req.body;

  const shippingCost = shippingMethod === 'express' ? 149 : 0;
  const subtotal     = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
  const total        = subtotal + shippingCost;

  const order = await Order.create({
    user: req.user!._id,
    items,
    shippingAddress,
    shippingMethod,
    paymentMethod,
    subtotal,
    shippingCost,
    total,
  });

  res.status(201).json(order);
});
```

---

### Users — `/api/users`

| Method | Endpoint | Body | Auth | Description |
|--------|----------|------|------|-------------|
| GET | `/me` | — | ✅ | Get current user profile |
| PUT | `/me` | `{ name, phone }` | ✅ | Update profile |
| PUT | `/me/password` | `{ currentPassword, newPassword }` | ✅ | Change password |
| GET | `/me/addresses` | — | ✅ | List saved addresses |
| POST | `/me/addresses` | `{ name, street, city, state, zip, phone }` | ✅ | Add address |
| PUT | `/me/addresses/:id` | address fields | ✅ | Update address |
| DELETE | `/me/addresses/:id` | — | ✅ | Delete address |
| GET | `/me/wishlist` | — | ✅ | Get wishlist |
| POST | `/me/wishlist/:productId` | — | ✅ | Toggle wishlist |

---

### Reviews — `/api/reviews`

| Method | Endpoint | Body | Auth | Description |
|--------|----------|------|------|-------------|
| GET | `/product/:productId` | — | — | Get reviews for product |
| POST | `/product/:productId` | `{ rating, comment }` | ✅ | Add review |
| DELETE | `/:id` | — | ✅ | Delete own review |

---

### Payment — `/api/payment`

| Method | Endpoint | Body | Auth | Description |
|--------|----------|------|------|-------------|
| POST | `/create-order` | `{ amount, orderId }` | ✅ | Create Razorpay order |
| POST | `/verify` | `{ razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId }` | ✅ | Verify & mark paid |

---

## 7. Auth — JWT Middleware

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request { user?: IUser; }
  }
}

export async function protect(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ message: 'Admin access required' });
  next();
}
```

---

## 8. File / Image Uploads (Cloudinary)

```typescript
// src/config/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export default cloudinary;
```

```typescript
// src/middleware/upload.ts
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bikershub/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'fill' }],
  } as object,
});

export const uploadImages = multer({ storage }).array('images', 5);
```

---

## 9. Payment Integration (Razorpay)

```typescript
// src/routes/payment.ts
import { Router } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { protect } from '../middleware/auth';
import Order from '../models/Order';

const router = Router();

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Step 1 — Create Razorpay order
router.post('/create-order', protect, async (req, res) => {
  const { amount, orderId } = req.body; // amount in paise

  const options = {
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: orderId,
  };

  const rzpOrder = await razorpay.orders.create(options);
  await Order.findByIdAndUpdate(orderId, { razorpayOrderId: rzpOrder.id });

  res.json({ razorpayOrderId: rzpOrder.id, amount: rzpOrder.amount });
});

// Step 2 — Verify signature & mark paid
router.post('/verify', protect, async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  const body        = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected    = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');

  if (expected !== razorpaySignature)
    return res.status(400).json({ message: 'Payment verification failed' });

  await Order.findByIdAndUpdate(orderId, {
    paymentStatus:     'paid',
    razorpayPaymentId,
  });

  res.json({ success: true });
});

export default router;
```

**Frontend snippet** (add to `Checkout.tsx` after placing the order):

```typescript
// Install: npm install razorpay  (frontend SDK via CDN or npm)
declare const Razorpay: any; // loaded via <script> in index.html

function openRazorpay(rzpOrderId: string, amount: number, orderId: string) {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount,
    currency: 'INR',
    order_id: rzpOrderId,
    handler: async (response: any) => {
      await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...response, orderId }),
      });
      // navigate to order confirmation
    },
  };
  new Razorpay(options).open();
}
```

Add to `index.html`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

---

## 10. Connecting the Frontend

### Create `src/lib/api.ts` in the frontend

```typescript
// rider-s-realm/src/lib/api.ts
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// ── Auth ────────────────────────────────────────────────────
export const api = {
  auth: {
    login:    (data: object) => request<{ token: string; user: object }>('/auth/login',    { method: 'POST', body: JSON.stringify(data) }),
    register: (data: object) => request<{ token: string; user: object }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },
  products: {
    list:   (params?: Record<string, string>) =>
      request<{ products: unknown[]; total: number }>(`/products?${new URLSearchParams(params)}`),
    getById: (id: string) => request<unknown>(`/products/${id}`),
  },
  orders: {
    place:  (data: object)  => request<unknown>('/orders',     { method: 'POST', body: JSON.stringify(data) }),
    myList: ()              => request<unknown[]>('/orders/my'),
    getById:(id: string)    => request<unknown>(`/orders/${id}`),
    cancel: (id: string)    => request<unknown>(`/orders/${id}/cancel`, { method: 'PUT' }),
  },
  cart: {
    get:    ()              => request<unknown>('/cart'),
    add:    (data: object)  => request<unknown>('/cart/add',    { method: 'POST', body: JSON.stringify(data) }),
    update: (data: object)  => request<unknown>('/cart/update', { method: 'PUT',  body: JSON.stringify(data) }),
    remove: (productId: string) => request<unknown>(`/cart/remove/${productId}`, { method: 'DELETE' }),
    clear:  ()              => request<unknown>('/cart/clear',  { method: 'DELETE' }),
  },
  users: {
    me:          ()             => request<unknown>('/users/me'),
    update:      (data: object) => request<unknown>('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
    addAddress:  (data: object) => request<unknown>('/users/me/addresses', { method: 'POST', body: JSON.stringify(data) }),
    toggleWish:  (id: string)   => request<unknown>(`/users/me/wishlist/${id}`, { method: 'POST' }),
  },
  reviews: {
    forProduct: (id: string)    => request<unknown[]>(`/reviews/product/${id}`),
    add:        (id: string, data: object) =>
      request<unknown>(`/reviews/product/${id}`, { method: 'POST', body: JSON.stringify(data) }),
  },
};
```

### Add to `.env` in frontend (`rider-s-realm/.env`):

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

### Key files to update in the frontend

| File | What to change |
|---|---|
| `src/pages/Login.tsx` | Call `api.auth.login()`, store token in `localStorage` |
| `src/pages/Signup.tsx` | Call `api.auth.register()`, store token |
| `src/context/CartContext.tsx` | Replace in-memory state with `api.cart.*` calls |
| `src/pages/Checkout.tsx` | Call `api.orders.place()`, then Razorpay flow |
| `src/pages/Shop.tsx` | Replace `products` from mock with `api.products.list()` |
| `src/pages/ProductDetail.tsx` | Call `api.products.getById(id)` |
| `src/pages/Profile.tsx` | Call `api.users.me()`, `api.orders.myList()` |
| `src/data/mockData.ts` | Keep interface types only; remove static data arrays |

---

## 11. CORS Configuration

```typescript
// src/index.ts — replace the cors line with:
app.use(cors({
  origin: [
    'http://localhost:8080',   // Vite dev
    'https://yourdomain.com',  // production
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

---

## 12. Scripts & Running

### `package.json` scripts

```json
{
  "scripts": {
    "dev":   "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### Run both servers during development

```bash
# Terminal 1 — Backend
cd bikershub-backend
npm run dev

# Terminal 2 — Frontend
cd rider-s-realm
npm run dev
```

Or use a root-level `package.json` with [concurrently](https://github.com/open-cli-tools/concurrently):

```bash
npm install -D concurrently
```
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix backend\" \"npm run dev --prefix rider-s-realm\""
  }
}
```

---

## 13. Deployment Checklist

- [ ] MongoDB Atlas cluster created, IP allowlist set (`0.0.0.0/0` for production)
- [ ] All `.env` values filled for production
- [ ] `JWT_SECRET` is at least 64 random characters
- [ ] `FRONTEND_URL` updated to production domain
- [ ] Cloudinary bucket created, product images migrated/re-uploaded
- [ ] Razorpay live keys swapped in (replace `rzp_test_` with `rzp_live_`)
- [ ] CORS `origin` list updated to production frontend URL
- [ ] Backend deployed (Railway / Render / EC2)
- [ ] Frontend `VITE_API_URL` updated to deployed backend URL, rebuilt
- [ ] HTTPS enabled on both frontend and backend
- [ ] Admin user seeded in DB (`role: 'admin'`)

---

> **Seed script tip:** Create `src/seed.ts` that imports your `products` array from the existing `mockData.ts` and bulk-inserts them into MongoDB so you don't lose any data during migration.

```typescript
// src/seed.ts
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { products } from '../../rider-s-realm/src/data/mockData'; // adjust path
import Product from './models/Product';
import { connectDB } from './config/db';

(async () => {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`✅ Seeded ${products.length} products`);
  await mongoose.disconnect();
})();
```

Run with:
```bash
npx ts-node src/seed.ts
```
