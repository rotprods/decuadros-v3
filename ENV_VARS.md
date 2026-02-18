# Environment Variables — De Cuadros V3

Copy this to `.env.local` and fill in the values.

## Required (App won't start without these)
```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

## Supabase Realtime (for KDS live updates)
Get from: Supabase Dashboard → Project Settings → API
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

## Stripe Payments
Get from: stripe.com → Developers → API Keys
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

For webhooks locally, run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

## Sentry Error Monitoring (optional but recommended)
Get from: sentry.io → Project → Settings → Client Keys (DSN)
```
SENTRY_DSN=https://xxx@sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
```

## Test Cards (Stripe)
- ✅ Success: `4242 4242 4242 4242`
- ❌ Decline: `4000 0000 0000 0002`
- Use any future date and any 3-digit CVC
