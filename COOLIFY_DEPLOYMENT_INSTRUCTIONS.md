# Coolify Deployment Instructions

## Quick Start

1. **Push your code to Git repository**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Coolify**
   - Go to your Coolify dashboard
   - Create new project/service
   - Choose "Docker Compose" as deployment method
   - Connect your Git repository
   - Set branch to `main` (or your deployment branch)
   - Configure environment variables (see below)
   - Deploy

## Required Environment Variables

In Coolify, set these environment variables:

- `JWT_SECRET`: A secure random string (generate one)
- `MONGO_INITDB_ROOT_PASSWORD`: Database password (set in docker-compose)
- `NODE_ENV`: `production`

## Optional Environment Variables

- `EMAIL_HOST`: SMTP host for email notifications
- `EMAIL_PORT`: SMTP port
- `EMAIL_USER`: SMTP username
- `EMAIL_PASS`: SMTP password

## Post-Deployment

1. **Check health**: Visit `https://your-domain/health`
2. **Access app**: Frontend will be available on your Coolify domain
3. **Database seeding** (optional): Run initial data setup if needed

## Troubleshooting

- Check Coolify logs for any build/deployment errors
- Verify environment variables are set correctly
- Ensure MongoDB container starts before backend
- Check network connectivity between services

## Services

- **Frontend**: Port 80 (main app)
- **Backend**: Port 5000 (API)
- **MongoDB**: Port 27017 (internal only)

The setup includes health checks and proper service dependencies for reliable startup.