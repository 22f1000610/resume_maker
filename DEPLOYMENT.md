# Deployment Guide

This guide covers deploying the Resume Maker application. The app is now 100% client-side and can be deployed as a static site.

## Recommended: GitHub Pages

The easiest way to deploy this app is via GitHub Pages using the included GitHub Actions workflow.

### Automatic Deployment

1. **Enable GitHub Pages:**
   - Go to your repository Settings > Pages
   - Under "Source", select "GitHub Actions"

2. **Push to main branch:**
   - The workflow at `.github/workflows/deploy.yml` will automatically build and deploy

3. **Access your app:**
   - Your app will be available at `https://<username>.github.io/resume_maker/`

### Manual Deployment to GitHub Pages

```bash
cd frontend
npm install
npm run build
npm run deploy  # Uses gh-pages package
```

## Alternative: Vercel

Vercel provides excellent React hosting with automatic deployments.

### Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

3. **Follow the prompts** to configure your project

### Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Connect your GitHub repository
4. Configure:
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Deploy!

## Alternative: Netlify

### Deploy via Netlify CLI

```bash
npm install -g netlify-cli
cd frontend
npm run build
netlify deploy --prod --dir=build
```

### Deploy via Netlify Dashboard

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `frontend/build` folder
3. Or connect your GitHub repository for continuous deployment

## Alternative: AWS S3 + CloudFront

For enterprise deployments:

1. **Build the app:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload to S3:**
   ```bash
   aws s3 sync build/ s3://your-bucket-name --delete
   ```

3. **Configure CloudFront** for HTTPS and caching

## Alternative: Docker (for container environments)

Create a simple Nginx container:

```dockerfile
# Dockerfile
FROM node:18 AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Build and run:
```bash
docker build -t resume-maker .
docker run -p 80:80 resume-maker
```

## Environment Configuration

The app works without any environment variables. All configuration is built-in.

### Optional: Custom LaTeX API

If you want to use a different LaTeX API, modify `frontend/src/latexGenerator.js`:

```javascript
const LATEX_API_URL = 'https://your-custom-api.com/compile';
```

## Performance Optimization

### Production Build

The `npm run build` command creates an optimized production build with:
- Minified JavaScript
- Optimized CSS
- Tree-shaking for unused code
- Source maps for debugging

### CDN Recommendations

For best performance, serve the static files from a CDN:
- CloudFlare (free tier available)
- AWS CloudFront
- Vercel Edge Network (automatic)
- Netlify CDN (automatic)

## Monitoring

### Basic Health Check

The app is purely client-side, so traditional health checks don't apply. Monitor:
- Page load times
- JavaScript errors (via browser dev tools or Sentry)
- PDF generation success rate (via LaTeX API status)

### Analytics

Consider adding:
- Google Analytics
- Plausible Analytics (privacy-focused)
- Simple Analytics

## Security Considerations

- The app processes data entirely in the browser
- No user data is sent to any server except the LaTeX API for PDF compilation
- LaTeX special characters are escaped to prevent injection
- HTTPS is recommended for all deployments

## Legacy Backend (Deprecated)

The original Flask backend is no longer required. If you need it for reference:

### Backend Only Deployment

```bash
cd resume_maker
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
gunicorn -w 4 -b 0.0.0.0:5000 backend.app:app
```

### Backend Environment Variables (Legacy)

| Variable | Default | Description |
|----------|---------|-------------|
| `LATEX_COMPILE_MODE` | `api` | `api` or `local` |
| `LATEX_API_URL` | `https://latex.ytotech.com/builds/sync` | LaTeX API endpoint |

---

**Note:** The new architecture is simpler, more reliable, and doesn't require any backend infrastructure.
