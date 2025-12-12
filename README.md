# Aadit Kannan - Resume Website

Modern, scroll-driven resume experience with smooth animations and premium design.

## Features

- 🎨 **Modern Design**: Black background with high-contrast typography
- ✨ **Scroll-Driven Animations**: Scramble reveal effects on headings
- 📱 **Fully Responsive**: Optimized for desktop, tablet, and mobile
- ⚡ **Performance Optimized**: 60fps animations, GPU-accelerated
- 🎯 **Section Navigation**: Progress indicator dots on the right

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   - The server will automatically open at `http://localhost:3000`
   - Or manually navigate to the URL shown in terminal

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
.
├── index.html          # Main HTML structure
├── styles.css          # All styles and responsive design
├── main.js             # Animation logic and scroll handlers
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
└── README.md          # This file
```

## Sections

1. **Overview** - Introduction and contact info
2. **Education** - UC Berkeley and High School
3. **Experience** - Professional and leadership roles
4. **Projects** - Engineering and innovation projects
5. **Leadership & Volunteering** - Community impact
6. **Skills** - Technical expertise
7. **CTA** - Contact and download links

## Customization

### Colors

Edit CSS variables in `styles.css`:

```css
:root {
  --bg-black: #000000;
  --text-white: #FFFFFF;
  --text-light: #E0E0E0;
  --text-gray: #CCCCCC;
}
```

### Animation Speed

Edit `CONFIG` in `main.js`:

```javascript
const CONFIG = {
  scrambleDuration: 1500, // ms
  fadeInDelay: 300,       // ms
  fadeInDuration: 800,    // ms
};
```

### Content

Edit content directly in `index.html` - all sections are clearly marked with IDs.

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Deploy automatically

### Netlify

1. Push to GitHub
2. Connect repository in Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`

### GitHub Pages

1. Build: `npm run build`
2. Push `dist/` folder to `gh-pages` branch
3. Enable GitHub Pages in repository settings

## Performance

- **Lighthouse Score**: Target 90+ on all metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Smooth Scrolling**: 60fps maintained

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Personal project - All rights reserved.

