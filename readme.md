# Clean Video Player for Vercel

A clean, ad-free video player with aggressive ad-blocking features deployed on Vercel.

## 🚀 Features

- **Ad Blocking**: Aggressive popup and ad blocking
- **Clean Interface**: Fullscreen video player with no distractions
- **Caching**: 30-minute cache for faster loading
- **Mobile Optimized**: Works perfectly on all devices
- **HTTPS Enforcement**: Automatically upgrades all connections to HTTPS

## 📦 Deployment to Vercel

### Method 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **For production deployment**:
   ```bash
   vercel --prod
   ```

### Method 2: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import this repository
4. Vercel will auto-detect settings
5. Click "Deploy"

## 🎯 Usage

### Home Page
```
https://your-app.vercel.app/
```
Shows a demo player with the test video.

### Embed Player
```
https://your-app.vercel.app/embed/VIDEO_URL
```

**Example**:
```
https://your-app.vercel.app/embed/https%3A%2F%2Fhglink.to%2Fe%2F0tmqi4jmtowr
```

### Using in HTML
```html
<iframe 
  src="https://your-app.vercel.app/embed/https%3A%2F%2Fhglink.to%2Fe%2F0tmqi4jmtowr" 
  width="100%" 
  height="500" 
  frameborder="0" 
  allowfullscreen
></iframe>
```

## 🛠️ Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**:
   ```
   http://localhost:3000
   ```

## 📝 API Endpoints

### `GET /`
Home page with demo player

### `GET /embed/:id`
Main embed player endpoint
- **Parameters**: `id` - Video URL (can be encoded or plain)
- **Returns**: HTML player page

### `GET /api/source/:id`
Legacy endpoint - redirects to embed
- **Returns**: JSON with embed URL

## 🔧 Configuration

### Cache Duration
Edit `api/index.js`, line with `setCache`:
```javascript
setCache(cacheKey, iframeSrc, 1800); // 30 minutes in seconds
```

### Ad Blocking
Ad blocking script is in the `getAdBlockScript()` function. Customize the `blockList` array to add more patterns:
```javascript
const blockList = [
  'doubleclick', 
  'googlesyndication', 
  'advertising',
  // Add more patterns here
];
```

## 🎨 Customization

### Player Styling
Edit the `generateCleanPlayer()` function to customize the player appearance.

### Error Page
Edit the `generateErrorPage()` function to customize error messages.

## 📋 Project Structure

```
.
├── api/
│   └── index.js          # Main application file
├── package.json          # Dependencies
├── vercel.json          # Vercel configuration
└── README.md            # This file
```

## 🔒 Security Features

- HTTPS enforcement
- Content Security Policy headers
- Popup blocking
- Ad script blocking
- Safe iframe handling

## 📱 Responsive Design

The player automatically adjusts to:
- Desktop browsers
- Tablets
- Mobile devices
- Different screen orientations

## 🐛 Troubleshooting

### Video not loading?
- Check if the video URL is valid
- Ensure HTTPS is being used
- Clear cache and try again

### Ads still showing?
- The ad blocker works on popup/overlay ads
- Some embedded ads in the video stream cannot be blocked
- Try refreshing the page

### Deployment issues?
- Make sure `vercel.json` is in the root directory
- Check that `api/index.js` exists
- Verify Node.js version compatibility

## 📄 License

MIT License - feel free to use this in your projects!

## 🙏 Credits

Built with:
- [Hono](https://hono.dev/) - Lightweight web framework
- [Vercel](https://vercel.com/) - Deployment platform

## 💡 Tips

- Use URL encoding for video URLs with special characters
- Cache is stored in memory and resets on deployment
- For production, consider using Redis for persistent cache

## 🔗 Example URLs

**Direct embed**:
```
/embed/https://hglink.to/e/0tmqi4jmtowr
```

**URL encoded**:
```
/embed/https%3A%2F%2Fhglink.to%2Fe%2F0tmqi4jmtowr
```

Both formats work!
