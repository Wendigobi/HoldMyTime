# HoldMyTime Setup Guide

## 🎨 UI/UX Complete ✅

The entire application has been redesigned with a modern black and gold theme:
- ✅ Centered layouts throughout
- ✅ Modern card-based design
- ✅ Consistent gold (#ffd700) and black (#000000) color scheme
- ✅ Responsive on all devices
- ✅ Professional typography and spacing
- ✅ Smooth transitions and hover effects

## 🔐 Google OAuth Setup

To enable Google sign-in, you need to configure it in your Supabase project:

### 1. Set up Google OAuth in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the consent screen if you haven't already:
   - Application name: "HoldMyTime"
   - Support email: your email
   - Authorized domains: `supabase.co` and your custom domain
6. For Application type, select **Web application**
7. Add authorized redirect URIs:
   ```
   https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
   ```
   Replace `<your-supabase-project-ref>` with your actual Supabase project reference ID

8. Click **Create** and copy your:
   - Client ID
   - Client Secret

### 2. Configure Google OAuth in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list and enable it
5. Paste in your Google OAuth credentials:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
6. Click **Save**

### 3. Update Environment Variables

Make sure your `.env.local` file has the correct site URL:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production, update to:
```env
NEXT_PUBLIC_SITE_URL=https://www.holdmytime.io
```

### 4. Test Google Sign-In

1. Run your development server: `npm run dev`
2. Go to `/login`
3. Click **Continue with Google**
4. You should be redirected to Google's OAuth consent screen
5. After authorizing, you'll be redirected back to `/auth/callback` and then to the dashboard

## 🚀 Current Features

### Pages
- **Landing Page** (`/`) - Modern hero section with feature cards
- **Login** (`/login`) - Google OAuth + Magic Link email sign-in
- **Dashboard** (`/dashboard`) - View all your booking pages
- **Create Booking Page** - Integrated into authenticated home page
- **Public Booking Page** (`/business/[slug]`) - Customer-facing booking form
- **Success Page** (`/success`) - Confirmation after payment
- **Canceled Page** (`/canceled`) - Shown when customer cancels checkout

### Authentication
- ✅ Google OAuth (requires setup above)
- ✅ Magic link email authentication
- ✅ Protected routes with middleware
- ✅ Automatic redirects to `/auth/callback`

### Booking Flow
1. Customer visits `/business/your-slug`
2. Fills out booking form (name, email, service, date, time, etc.)
3. Clicks "Pay Deposit" → Redirects to Stripe checkout
4. After payment → Redirects to `/success`
5. If canceled → Redirects to `/canceled`

### API Routes
- `POST /api/bookings` - Create booking + Stripe checkout session
- `GET /api/bookings` - Get user's bookings (authenticated)
- `POST /api/stripe-webhook` - Handle Stripe payment events

## 🎯 Next Steps

### For Development
```bash
npm run dev
```
Visit `http://localhost:3000`

### For Production
1. Set up Google OAuth (see above)
2. Configure Stripe webhook in Stripe Dashboard:
   - URL: `https://yourdomain.com/api/stripe-webhook`
   - Events: `checkout.session.completed`
3. Update environment variables in Vercel/your hosting platform
4. Deploy: `vercel --prod` or `npm run build`

## 📋 Environment Variables Checklist

Required variables (all set in `.env.local`):

- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- ✅ `NEXT_PUBLIC_SITE_URL` - Your site URL (for redirects)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side)
- ✅ `STRIPE_SECRET_KEY` - Stripe secret key
- ✅ `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

## 🐛 Troubleshooting

### Google Sign-In Not Working
1. Check that Google OAuth is enabled in Supabase dashboard
2. Verify redirect URI matches exactly (including trailing slash)
3. Check browser console for errors
4. Ensure `NEXT_PUBLIC_SITE_URL` is set correctly

### 404 Errors
All navigation has been fixed. If you still see 404s:
1. Clear browser cache
2. Restart dev server
3. Check that the route exists in the `app/` directory

### Styling Issues
If styles aren't loading:
1. Check that `globals.css` is imported in `layout.tsx`
2. Restart dev server
3. Clear `.next` build cache: `rm -rf .next`

## 📚 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Custom CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Google OAuth + Magic Links)
- **Payments**: Stripe Checkout
- **Hosting**: Vercel (recommended)

## 🎨 Design System

### Colors
- Background: `#000000` (black)
- Cards: `#111111` (dark gray)
- Gold: `#ffd700` (primary accent)
- Text Primary: `#ffffff` (white)
- Text Secondary: `#cccccc` (light gray)
- Text Muted: `#888888` (medium gray)

### CSS Classes
- `.card` - Standard card with border
- `.card-gold` - Card with gold border (for emphasis)
- `.btn` - Primary button (gold gradient)
- `.btn-outline` - Secondary button (gold outline)
- `.field` - Form input styling
- `.centered-layout` - Full-height centered container
- `.text-gold` - Gold text color
- `.text-secondary` - Secondary text color
- `.text-muted` - Muted text color

All pages use these classes consistently for a cohesive look.
