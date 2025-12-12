# Deployment Guide - aaditkannan.com

This guide will walk you through deploying your site to Vercel and transferring your domain from Wix.

## Prerequisites

- GitHub account (for Vercel deployment)
- Access to your domain registrar (where you bought aaditkannan.com)
- Wix account access (to cancel subscription)

## Step 1: Prepare Your Site for Production

### Build the site locally (test first)

```bash
npm run build
```

This creates a `dist` folder with your production-ready site. Test it locally:

```bash
npm run preview
```

Visit `http://localhost:4173` to verify everything works.

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Easiest)

1. **Create a GitHub Repository**
   - Go to [GitHub](https://github.com/new)
   - Create a new repository (e.g., `aaditkannan-portfolio`)
   - Push your code:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/aaditkannan-portfolio.git
     git push -u origin main
     ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign up/login
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite settings
   - Click "Deploy"
   - Your site will be live at `your-project.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts. For production deployment:
```bash
vercel --prod
```

## Step 3: Configure Your Domain on Vercel

1. **In Vercel Dashboard:**
   - Go to your project → Settings → Domains
   - Click "Add Domain"
   - Enter `aaditkannan.com` and `www.aaditkannan.com`
   - Vercel will show you DNS records to add

2. **DNS Records to Add:**
   Vercel will provide something like:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21 (example - use Vercel's actual IP)
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com (example - use Vercel's actual value)
   ```

## Step 4: Update DNS at Your Domain Registrar

### If your domain is at:
- **Namecheap, GoDaddy, Google Domains, etc.**
  1. Log into your registrar
  2. Find DNS Management / DNS Settings
  3. Remove Wix DNS records
  4. Add the Vercel DNS records from Step 3
  5. Save changes

### If your domain is managed by Wix:
1. **In Wix Dashboard:**
   - Go to Settings → Domains
   - Find `aaditkannan.com`
   - Click "Manage DNS" or "Transfer DNS"
   - Note: You may need to unlock the domain first

2. **Transfer DNS Management:**
   - Option A: Point nameservers to your registrar
   - Option B: Use Wix's DNS editor to add Vercel records
   - Option C: Transfer domain to another registrar (takes 5-7 days)

## Step 5: Wait for DNS Propagation

- DNS changes can take 24-48 hours to fully propagate
- Check status: [whatsmydns.net](https://www.whatsmydns.net)
- Vercel will show domain status in dashboard

## Step 6: Cancel Wix Subscription

1. **In Wix Dashboard:**
   - Go to Settings → Subscriptions
   - Find your Premium Plan
   - Click "Cancel Subscription"
   - Follow prompts (may need to confirm cancellation)

2. **Important Notes:**
   - Cancel AFTER DNS is working (to avoid downtime)
   - Some plans have cancellation fees/refunds
   - Keep Wix account active until domain transfer is complete

## Step 7: Verify Everything Works

1. Visit `https://aaditkannan.com` (should show your new site)
2. Visit `https://www.aaditkannan.com` (should redirect or show site)
3. Test all pages: Home, Resume, Connect, Footage
4. Check HTTPS is working (Vercel provides free SSL)

## Troubleshooting

### Domain not working?
- Check DNS propagation: [whatsmydns.net](https://www.whatsmydns.net)
- Verify DNS records match Vercel's requirements
- Wait 24-48 hours for full propagation

### Site shows old Wix content?
- Clear browser cache (Ctrl+Shift+Delete)
- Try incognito/private browsing
- Check DNS records are correct

### Need help?
- Vercel Docs: https://vercel.com/docs
- Vercel Support: support@vercel.com

## Post-Deployment Checklist

- [ ] Site is live on Vercel
- [ ] Domain is connected and working
- [ ] All pages load correctly
- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] Videos/images load properly
- [ ] Mobile responsive works
- [ ] Wix subscription cancelled
- [ ] Old Wix site is down/redirected

