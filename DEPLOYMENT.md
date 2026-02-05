# SAAS HRMS Payroll System - Deployment Guide

## Overview
This is a comprehensive HRMS + Payroll system built with React (frontend), Node.js + Express (backend), and MongoDB.

## Architecture
- **Frontend**: React + Vite, served via Nginx
- **Backend**: Node.js + Express API
- **Database**: MongoDB
- **Deployment**: Docker + Docker Compose

## Prerequisites
- Docker & Docker Compose
- Coolify (or any Docker-compatible platform)
- MongoDB instance

## Environment Variables

### Backend (.env)
```bash
# Application Configuration
NODE_ENV=production
PORT=5000

# Database Configuration
MONGO_URI=mongodb://username:password@host:port/database

# Security Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload Configuration
UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=5242880
```

### Frontend
The frontend uses relative API paths and will automatically proxy to the backend.

## Deployment Steps

### 1. Database Setup
```bash
# Run database seeding (optional - creates initial roles and users)
cd backend
npm run seed
```

### 2. Docker Deployment
```bash
# Build and start all services
docker-compose up -d --build

# Or for production deployment
docker-compose -f docker-compose.yml up -d
```

### 3. Coolify Deployment
Coolify supports Docker Compose deployments. Follow these steps:

1. **Connect Repository**: Link your Git repository to Coolify
2. **Create Service**: Choose "Docker Compose" as the deployment method
3. **Configure Environment**:
   - Set `JWT_SECRET` to a secure random string
   - Optionally configure email settings
4. **Deploy**: Coolify will automatically build and deploy using the docker-compose.yml
5. **Access**: The frontend will be available on the configured domain, backend APIs on port 5000

**Note**: Coolify handles port mapping automatically. The frontend (port 80) serves as the main application, with backend APIs proxied internally.

### 3. Health Checks
```bash
# Backend health check
curl http://your-domain/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "database": "connected"
}
```

**Note**: Health checks are configured in docker-compose.yml for proper service startup ordering.

## Service Configuration

### Backend Service
- **Port**: 5000 (internal)
- **Health Check**: `/health`
- **API Base**: `/api`
- **Uploads**: `/app/uploads`

### Frontend Service
- **Port**: 80 (internal)
- **Build**: Static files served via Nginx
- **SPA Routing**: Configured for React Router

### Database Service
- **Port**: 27017 (internal)
- **Volume**: `mongo-data` for persistence
- **Auth**: Root user with password

## Security Features

### Backend
- JWT authentication
- Rate limiting (1000 requests/15min)
- Helmet security headers
- Input sanitization
- CORS enabled
- File upload restrictions

### Database
- Authentication required
- Network isolation via Docker networks
- Persistent volumes for data

## Monitoring & Logging

### Health Endpoints
- `GET /health` - Application health status
- Database connection status
- Uptime information

### Logs
- Application logs via Docker
- MongoDB logs accessible via `docker logs`
- Error logging to console and files

## File Structure
```
├── backend/
│   ├── controllers/     # API controllers
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── middlewares/    # Express middlewares
│   ├── uploads/        # File uploads directory
│   └── Dockerfile
├── frontend/
│   ├── src/           # React application
│   ├── public/        # Static assets
│   └── Dockerfile
├── docker-compose.yml # Docker orchestration
└── DEPLOYMENT.md     # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

### HRMS
- `GET /api/hrms/employees` - Employee management
- `GET /api/hrms/assets` - Asset management
- `POST /api/payroll/calculate` - Payroll calculations
- `GET /api/payroll/:id/export` - PDF export

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MONGO_URI environment variable
   - Ensure MongoDB is running and accessible
   - Verify network connectivity between containers

2. **Build Failures**
   - Clear Docker cache: `docker system prune -a`
   - Check Node.js version compatibility
   - Verify all dependencies are available

3. **File Upload Issues**
   - Check upload directory permissions
   - Verify MAX_FILE_SIZE configuration
   - Ensure sufficient disk space

4. **PDF Generation Errors**
   - Verify Puppeteer dependencies
   - Check system fonts
   - Ensure sufficient memory

### Logs & Debugging
```bash
# View container logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongo

# Access container shell
docker-compose exec backend sh
docker-compose exec frontend sh
```

## Performance Optimization

### Backend
- Connection pooling for MongoDB
- Rate limiting to prevent abuse
- Compression middleware
- Proper indexing on database queries

### Frontend
- Code splitting via Vite
- Asset optimization and minification
- Lazy loading for routes
- Service worker for caching (future)

### Database
- Proper indexing on frequently queried fields
- Connection pooling
- Query optimization

## Backup & Recovery

### Database Backup
```bash
# Create backup
docker-compose exec mongo mongodump --db saas_db --out /backup

# Restore backup
docker-compose exec mongo mongorestore /backup/saas_db
```

### File Backups
- Uploads directory is volume-mounted
- Implement regular backups of `/app/uploads`

## Scaling Considerations

### Horizontal Scaling
- Stateless backend design
- Session storage in database
- File storage on shared volumes

### Database Scaling
- MongoDB replica sets for high availability
- Sharding for large datasets
- Connection pooling optimization

## Security Checklist

- [ ] Environment variables configured
- [ ] JWT secret changed from default
- [ ] Database credentials secured
- [ ] File upload restrictions in place
- [ ] Rate limiting configured
- [ ] HTTPS enabled (via reverse proxy)
- [ ] CORS properly configured
- [ ] Input validation active
- [ ] Error messages don't leak sensitive info

## Support

For deployment issues:
1. Check container logs
2. Verify environment variables
3. Test health endpoints
4. Review network connectivity
5. Check resource allocation

## Version Information
- Node.js: 18.x
- MongoDB: 7.x
- React: 18.x
- Docker: 20.x+