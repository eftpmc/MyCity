# 🌐 Urba Web Deployment Guide

## Overview
This guide shows you how to make Urba accessible via web links so users can access your app through URLs.

---

## 🚀 Option 1: Expo Web (Recommended - Easiest)

### Step 1: Build for Web
```bash
cd "/Applications/MyCity /MyCity"
npx expo export --platform web
```

This creates a `dist/` folder with static files ready for deployment.

### Step 2: Deploy to Netlify (Free)
1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   npx expo export --platform web
   netlify deploy --prod --dir=dist
   ```

3. **Get your URL:** Netlify will give you a URL like `https://amazing-app-123456.netlify.app`

### Step 3: Deploy to Vercel (Free)
1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   npx expo export --platform web
   cd dist
   vercel --prod
   ```

3. **Get your URL:** Vercel will give you a URL like `https://urba-abc123.vercel.app`

---

## 🔗 Option 2: Deep Linking Setup

### Configure Deep Links in app.json
```json
{
  "expo": {
    "scheme": "urba",
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      [
        "expo-router",
        {
          "origin": "https://your-domain.com"
        }
      ]
    ]
  }
}
```

### Supported URL Patterns
Once deployed, users can access:

- **Main App:** `https://your-domain.com/`
- **Specific City:** `https://your-domain.com/city/San Francisco/CA`
- **City Reports:** `https://your-domain.com/city/San Francisco/CA/reports`
- **City Details:** `https://your-domain.com/city/San Francisco/CA/details`

---

## 📱 Option 3: Progressive Web App (PWA)

### Add PWA Configuration
Create `public/manifest.json`:
```json
{
  "name": "Urba - Urban Environmental Intelligence",
  "short_name": "Urba",
  "description": "Real-time environmental data and disaster monitoring for US cities",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#4A90E2",
  "icons": [
    {
      "src": "/assets/images/logo.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### Update app.json for PWA
```json
{
  "expo": {
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png",
      "name": "Urba",
      "shortName": "Urba",
      "description": "Urban Environmental Intelligence",
      "startUrl": "/",
      "display": "standalone",
      "themeColor": "#4A90E2",
      "backgroundColor": "#000000"
    }
  }
}
```

---

## 🌍 Option 4: Custom Domain Setup

### 1. Buy a Domain
- Purchase from Namecheap, GoDaddy, or Google Domains
- Suggested domains: `urba.app`, `urbadata.com`, `citywellness.app`

### 2. Configure DNS
Point your domain to your hosting provider:

**For Netlify:**
```
A Record: @ → 75.2.60.5
CNAME: www → your-site.netlify.app
```

**For Vercel:**
```
A Record: @ → 76.76.19.61
CNAME: www → cname.vercel-dns.com
```

### 3. SSL Certificate
Both Netlify and Vercel provide free SSL certificates automatically.

---

## 🔧 Option 5: GitHub Pages (Free)

### 1. Create GitHub Repository
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/urba.git
git push -u origin main
```

### 2. Enable GitHub Pages
1. Go to repository Settings
2. Scroll to "Pages" section
3. Source: "Deploy from a branch"
4. Branch: "main" / "dist" folder

### 3. Deploy Script
Add to `package.json`:
```json
{
  "scripts": {
    "deploy": "expo export --platform web && gh-pages -d dist"
  }
}
```

---

## 📊 Option 6: Firebase Hosting (Free)

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Initialize Firebase
```bash
firebase init hosting
```

### 3. Configure firebase.json
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 4. Deploy
```bash
npx expo export --platform web
firebase deploy
```

---

## 🎯 Recommended Deployment Strategy

### For Quick Launch (Today):
1. **Use Netlify** - Fastest setup
2. **Deploy with:** `npx expo export --platform web && netlify deploy --prod --dir=dist`
3. **Get URL:** Share the Netlify URL immediately

### For Production (This Week):
1. **Buy custom domain** (e.g., `urba.app`)
2. **Use Vercel** for better performance
3. **Set up PWA** for mobile app-like experience
4. **Configure deep linking** for city-specific URLs

---

## 🔗 Sharing Your App

### Direct Links
Once deployed, share these URLs:

- **Main App:** `https://your-domain.com/`
- **San Francisco:** `https://your-domain.com/city/San Francisco/CA`
- **New York Reports:** `https://your-domain.com/city/New York/NY/reports`

### Social Media Sharing
```html
<!-- Open Graph Meta Tags -->
<meta property="og:title" content="Urba - Urban Environmental Intelligence" />
<meta property="og:description" content="Real-time environmental data and disaster monitoring for US cities" />
<meta property="og:image" content="https://your-domain.com/assets/images/logo.png" />
<meta property="og:url" content="https://your-domain.com/" />
```

---

## 🚀 Quick Start Commands

### Deploy to Netlify (5 minutes):
```bash
cd "/Applications/MyCity /MyCity"
npx expo export --platform web
npx netlify deploy --prod --dir=dist
```

### Deploy to Vercel (5 minutes):
```bash
cd "/Applications/MyCity /MyCity"
npx expo export --platform web
cd dist && npx vercel --prod
```

### Deploy to Firebase (10 minutes):
```bash
cd "/Applications/MyCity /MyCity"
npm install -g firebase-tools
firebase init hosting
npx expo export --platform web
firebase deploy
```

---

## 📱 Mobile App Store Links

### For App Store Distribution:
1. **Build with EAS:**
   ```bash
   npx eas build --platform ios --profile production
   npx eas build --platform android --profile production
   ```

2. **Submit to Stores:**
   ```bash
   npx eas submit --platform ios
   npx eas submit --platform android
   ```

3. **Get Store URLs:**
   - iOS: `https://apps.apple.com/app/urba/id123456789`
   - Android: `https://play.google.com/store/apps/details?id=com.arinora.MyCity`

---

## 🎉 Result

After deployment, users can:
- ✅ Access Urba via web browser
- ✅ Bookmark specific cities
- ✅ Share city-specific links
- ✅ Use on any device (mobile, tablet, desktop)
- ✅ Install as PWA on mobile devices
- ✅ Access via custom domain

**Your app will be live and accessible worldwide!** 🌍

---

## 🆘 Troubleshooting

### Common Issues:

1. **Build fails:** Run `npx expo install --fix` first
2. **Web not working:** Check if `react-native-web` is installed
3. **Maps not loading:** Add Google Maps API key for web
4. **Firebase errors:** Ensure web config is correct

### Need Help?
- Check Expo docs: https://docs.expo.dev/workflow/web/
- Netlify docs: https://docs.netlify.com/
- Vercel docs: https://vercel.com/docs

---

## 🎯 Next Steps

1. **Choose hosting provider** (Netlify recommended for quick start)
2. **Run deployment command**
3. **Test your live URL**
4. **Share with users!**
5. **Set up custom domain** (optional)
6. **Configure PWA** (optional)

**Your Urba app will be accessible via link in minutes!** 🚀
