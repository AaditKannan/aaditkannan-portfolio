# Favicon Setup Guide

To complete the SEO setup, you need to create favicon files. Here are the files needed and how to create them:

## Required Favicon Files

Place these files in the root directory (`/`):

1. **favicon.ico** - Main favicon (16x16, 32x32, 48x48 sizes combined)
2. **favicon-16x16.png** - 16x16 PNG icon
3. **favicon-32x32.png** - 32x32 PNG icon
4. **apple-touch-icon.png** - 180x180 PNG for iOS devices

## Quick Ways to Generate Favicons

### Option 1: Online Favicon Generator (Easiest)
1. Go to https://realfavicongenerator.net/ or https://favicon.io/
2. Upload your image (ideally square, at least 512x512px)
   - You can use your photo.jpg or create a simple "AK" monogram
   - Or use your initials with a nice font
3. Download the generated files
4. Place them in the root directory of your project

### Option 2: Use Your Photo
If you want to use your existing photo:
1. Crop your `assets/photo.jpg` to square format
2. Resize to at least 512x512px
3. Upload to https://realfavicongenerator.net/
4. Download and place files in root directory

### Option 3: Simple Text/Initials Favicon
Create a simple "AK" or "A" favicon:
1. Use https://favicon.io/favicon-generator/
2. Enter text "AK" or "A"
3. Choose font and colors (white on black background would match your site)
4. Download and place files in root directory

## File Placement

Once generated, place all favicon files in the **root directory** (same level as index.html):

```
aaditkannancom/
├── index.html
├── resume.html
├── favicon.ico          ← Place here
├── favicon-16x16.png    ← Place here
├── favicon-32x32.png    ← Place here
├── apple-touch-icon.png ← Place here
└── ...
```

## Verify Favicon is Working

After adding files and deploying:
1. Visit your site: https://aaditkannan.com
2. Check the browser tab - you should see the favicon
3. Test on mobile - iOS will show the apple-touch-icon

The SEO meta tags are already added to all pages, so once you add the favicon files, everything will work!

