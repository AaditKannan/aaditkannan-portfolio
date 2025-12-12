# Quick Deployment Steps

## 🚀 Fast Track to Going Live

### Step 1: Push to GitHub (5 minutes)

1. **Create GitHub repo:**
   - Go to https://github.com/new
   - Name it: `aaditkannan-portfolio`
   - Make it public or private (your choice)
   - Don't initialize with README

2. **Push your code:**
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   git branch -M main
   git remote add origin https://github.com/aaditkannan/aaditkannan-portfolio.git
   git push -u origin main
   ```

### Step 2: Deploy to Vercel (3 minutes)

1. Go to https://vercel.com
2. Sign up/Login (use GitHub to connect)
3. Click "Add New Project"
4. Import your `aaditkannan-portfolio` repo
5. Vercel auto-detects Vite - just click "Deploy"
6. Wait 1-2 minutes for deployment
7. Your site is live at `your-project.vercel.app` ✅

### Step 3: Connect Your Domain (10 minutes)

1. **In Vercel Dashboard:**
   - Go to your project → Settings → Domains
   - Click "Add Domain"
   - Enter: `aaditkannan.com`
   - Click "Add"
   - Also add: `www.aaditkannan.com`

2. **Vercel will show DNS records like:**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME  
   Name: www
   Value: cname.vercel-dns.com
   ```
   **Copy these values!**

### Step 4: Update DNS (5 minutes)

**If domain is at Wix:**
1. Log into Wix → Settings → Domains
2. Click on `aaditkannan.com`
3. Go to "DNS Settings" or "Manage DNS"
4. Remove old Wix records
5. Add the Vercel records from Step 3
6. Save

**If domain is at another registrar (Namecheap, GoDaddy, etc.):**
1. Log into your registrar
2. Find "DNS Management" or "DNS Settings"
3. Add the Vercel records from Step 3
4. Save

### Step 5: Wait & Verify (24-48 hours)

- DNS changes take time to propagate
- Check status: https://www.whatsmydns.net/#A/aaditkannan.com
- Vercel dashboard will show when domain is connected
- Once connected, visit `https://aaditkannan.com` - should work! 🎉

### Step 6: Cancel Wix (After DNS works!)

1. **Wait until your new site is live** (check aaditkannan.com works)
2. Log into Wix
3. Settings → Subscriptions
4. Cancel your Premium Plan
5. Follow cancellation prompts

## ⚠️ Important Notes

- **Don't cancel Wix until DNS is working** - you'll have downtime
- DNS can take 24-48 hours to fully propagate
- Vercel provides free SSL (HTTPS) automatically
- Your site will be live on Vercel immediately, domain just needs DNS

## 🆘 Need Help?

- Vercel Docs: https://vercel.com/docs
- Check DNS: https://www.whatsmydns.net
- Vercel Support: support@vercel.com

## ✅ Final Checklist

- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Domain added in Vercel
- [ ] DNS records updated at registrar/Wix
- [ ] Site accessible at aaditkannan.com (after DNS propagates)
- [ ] All pages working (Home, Resume, Connect, Footage)
- [ ] Wix subscription cancelled

