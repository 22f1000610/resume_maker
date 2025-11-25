# Deployment Guide

This guide covers deploying the Resume Maker application to production.

## Production Considerations

### Security
- Use HTTPS in production
- Set up proper CORS policies
- Use environment variables for configuration
- Run backend with a production WSGI server (not Flask's dev server)
- Implement rate limiting on API endpoints
- Add authentication if needed

### Performance
- Enable frontend production build
- Compress static assets
- Add caching headers
- Consider using a CDN for frontend
- Optimize PDF compilation (use persistent compilation directories)

## Deployment Options

### Option 1: Serverless Deployment (Recommended)

The application supports serverless deployment using an external LaTeX API for PDF generation. No TeX Live installation required.

#### Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Create `vercel.json` in project root:**
   ```json
   {
     "builds": [
       { "src": "backend/app.py", "use": "@vercel/python" }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "backend/app.py" }
     ]
   }
   ```

3. **Set environment variables in Vercel:**
   ```
   LATEX_COMPILE_MODE=api
   ```

4. **Deploy:**
   ```bash
   vercel
   ```

#### AWS Lambda / Google Cloud Functions

1. **Set environment variable:**
   ```
   LATEX_COMPILE_MODE=api
   ```

2. **Deploy using your preferred framework** (Serverless Framework, SAM, etc.)

> **Note:** Serverless deployments use the external LaTeX API (latex.ytotech.com) for PDF generation. DOCX conversion is skipped if pandoc is not available.

### Option 2: Traditional Server Deployment

#### Backend

1. **Install dependencies on server:**
   ```bash
   sudo apt-get update
   sudo apt-get install python3 python3-pip python3-venv
   sudo apt-get install texlive-latex-base texlive-fonts-recommended texlive-fonts-extra texlive-latex-extra
   sudo apt-get install pandoc
   ```

2. **Set up the application:**
   ```bash
   cd /var/www/resume_maker
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   pip install gunicorn  # Production WSGI server
   ```

3. **Create systemd service** (`/etc/systemd/system/resume-maker.service`):
   ```ini
   [Unit]
   Description=Resume Maker Backend
   After=network.target

   [Service]
   User=www-data
   WorkingDirectory=/var/www/resume_maker
   Environment="PATH=/var/www/resume_maker/venv/bin"
   ExecStart=/var/www/resume_maker/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 backend.app:app

   [Install]
   WantedBy=multi-user.target
   ```

4. **Start the service:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable resume-maker
   sudo systemctl start resume-maker
   ```

#### Frontend

1. **Build for production:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Serve with Nginx** (`/etc/nginx/sites-available/resume-maker`):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           root /var/www/resume_maker/frontend/build;
           try_files $uri $uri/ /index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       # Health check
       location /health {
           proxy_pass http://127.0.0.1:5000;
       }
   }
   ```

3. **Enable site and restart Nginx:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/resume-maker /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Set up SSL with Let's Encrypt:**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### Option 3: Docker Deployment

1. **Create Dockerfile for backend** (`Dockerfile.backend`):
   ```dockerfile
   FROM ubuntu:22.04

   # Install dependencies
   RUN apt-get update && apt-get install -y \
       python3 \
       python3-pip \
       texlive-latex-base \
       texlive-fonts-recommended \
       texlive-fonts-extra \
       texlive-latex-extra \
       pandoc \
       && rm -rf /var/lib/apt/lists/*

   WORKDIR /app

   COPY requirements.txt .
   RUN pip3 install -r requirements.txt gunicorn

   COPY backend/ ./backend/
   COPY templates/ ./templates/
   COPY cds\ jnu\ logo.png .

   EXPOSE 5000

   CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "backend.app:app"]
   ```

2. **Create Dockerfile for frontend** (`Dockerfile.frontend`):
   ```dockerfile
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
   ```

3. **Create docker-compose.yml:**
   ```yaml
   version: '3.8'

   services:
     backend:
       build:
         context: .
         dockerfile: Dockerfile.backend
       ports:
         - "5000:5000"
       volumes:
         - ./output:/app/output
       environment:
         - FLASK_ENV=production

     frontend:
       build:
         context: .
         dockerfile: Dockerfile.frontend
       ports:
         - "80:80"
       depends_on:
         - backend
   ```

4. **Deploy with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

### Option 4: Cloud Platform (Heroku Example)

1. **Create Procfile:**
   ```
   web: gunicorn backend.app:app
   ```

2. **Create runtime.txt:**
   ```
   python-3.11
   ```

3. **Add buildpacks:**
   ```bash
   heroku buildpacks:add heroku/python
   heroku buildpacks:add https://github.com/Thermondo/heroku-buildpack-texlive.git
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

## Environment Variables

Create `.env` file:

```bash
# Production
FLASK_ENV=production
FLASK_DEBUG=False

# Frontend API URL
REACT_APP_API_URL=https://api.your-domain.com

# LaTeX compilation mode: 'api' (serverless) or 'local' (requires TeX Live)
LATEX_COMPILE_MODE=api

# Optional: Custom LaTeX API URL
# LATEX_API_URL=https://latex.ytotech.com/builds/sync

# Optional: File storage
OUTPUT_DIR=/var/resume_maker/output
TEMP_DIR=/var/resume_maker/temp
```

## Monitoring and Logging

### Application Logs

```bash
# Systemd service logs
sudo journalctl -u resume-maker -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Health Checks

Add monitoring for:
- `/health` endpoint
- PDF compilation success rate
- API response times
- Disk space (for output files)

## Backup and Cleanup

### Automatic Cleanup Script

Create a cron job to clean old generated files:

```bash
# /etc/cron.daily/resume-maker-cleanup
#!/bin/bash
find /var/www/resume_maker/output -type f -mtime +1 -delete
```

## Scaling Considerations

- **Horizontal scaling:** Use load balancer for multiple backend instances
- **File storage:** Consider S3/cloud storage for generated files
- **Caching:** Implement Redis for frequently accessed data
- **Queue:** Add Celery for async PDF generation if needed

## Troubleshooting

### PDF Generation Fails in Production

- Verify TeX Live is fully installed
- Check file permissions for temp directories
- Ensure logo file is accessible
- Review pdflatex logs

### High Memory Usage

- Limit concurrent PDF compilations
- Clean up temp files regularly
- Monitor LaTeX processes

### CORS Issues

Update Flask CORS configuration:
```python
CORS(app, resources={r"/api/*": {"origins": "https://your-domain.com"}})
```

## Security Checklist

- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] File upload size limits
- [ ] Temp directory cleanup
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies regularly updated
- [ ] LaTeX compilation sandboxed

## Performance Optimization

- Enable gzip compression
- Cache static assets
- Optimize LaTeX compilation
- Use CDN for frontend assets
- Implement API response caching
- Monitor and optimize database queries (if added)

## Maintenance

- Regularly update dependencies
- Monitor disk usage
- Review logs for errors
- Test PDF generation periodically
- Keep SSL certificates updated
