# Connecting Domain from Squarespace to Vercel

Since your domain `aaditkannan.com` is registered at Squarespace, here's how to connect it to Vercel.

## Option 1: Use DNS Records (Recommended - Easier)

This keeps Squarespace as your registrar and just points DNS to Vercel.

### Step 1: Get DNS Records from Vercel

1. After deploying to Vercel, go to your project → Settings → Domains
2. Add `aaditkannan.com` and `www.aaditkannan.com`
3. Vercel will show you DNS records like:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
   **Copy these exact values!**

### Step 2: Update DNS in Squarespace

1. **Log into Squarespace:**
   - Go to https://www.squarespace.com
   - Log into your account

2. **Navigate to Domain Settings:**
   - Go to Settings → Domains
   - Click on `aaditkannan.com`
   - Look for "DNS Settings" or "Advanced DNS Settings"

3. **Remove Wix DNS Records:**
   - Find any records pointing to Wix (usually CNAME records)
   - Delete them

4. **Add Vercel DNS Records:**
   - Click "Add Record" or "Add DNS Record"
   - Add the A record:
     - Type: **A**
     - Host: **@** (or leave blank, or use the root domain)
     - Points to: **76.76.21.21** (use Vercel's actual IP)
     - TTL: 3600 (or default)
   - Add the CNAME record:
     - Type: **CNAME**
     - Host: **www**
     - Points to: **cname.vercel-dns.com** (use Vercel's actual value)
     - TTL: 3600 (or default)
   - Save both records

5. **Remove Wix Connection (if needed):**
   - In Squarespace, if there's a "Connected Sites" or "External Sites" section
   - Disconnect/remove Wix connection
   - This won't affect your domain registration

### Step 3: Wait for DNS Propagation

- DNS changes take 24-48 hours to fully propagate
- Check status: https://www.whatsmydns.net/#A/aaditkannan.com
- Vercel dashboard will show when domain is connected

---

## Option 2: Change Nameservers (Alternative)

If Squarespace doesn't allow custom DNS records, you can change nameservers to Vercel.

### Step 1: Get Vercel Nameservers

1. In Vercel → Project → Settings → Domains
2. When adding domain, Vercel may offer nameserver option
3. You'll get nameservers like:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

### Step 2: Update Nameservers in Squarespace

1. Log into Squarespace → Settings → Domains
2. Click on `aaditkannan.com`
3. Find "Nameservers" or "DNS Nameservers"
4. Change from Squarespace nameservers to Vercel's nameservers
5. Save

**Note:** This gives Vercel full DNS control. You'll manage DNS in Vercel dashboard going forward.

---

## Recommended Approach

**Use Option 1 (DNS Records)** - It's simpler and keeps Squarespace as your registrar. You just point DNS to Vercel.

## After DNS is Working

1. **Verify site is live:**
   - Visit `https://aaditkannan.com` (should show your new site)
   - Visit `https://www.aaditkannan.com` (should also work)

2. **Cancel Wix subscription:**
   - Log into Wix
   - Settings → Subscriptions
   - Cancel your Premium Plan
   - Wix no longer has access to your domain, so this is safe

3. **Keep Squarespace:**
   - You can keep your Squarespace account for domain management
   - Or transfer domain to another registrar later if you want
   - Domain registration is separate from hosting

## Troubleshooting

**Domain not working?**
- Check DNS propagation: https://www.whatsmydns.net
- Verify DNS records match Vercel's requirements exactly
- Wait 24-48 hours for full propagation

**Still seeing Wix site?**
- Clear browser cache
- Try incognito/private browsing
- Check DNS records are correct

**Need help?**
- Squarespace Support: https://support.squarespace.com
- Vercel Docs: https://vercel.com/docs
- Vercel Support: support@vercel.com

