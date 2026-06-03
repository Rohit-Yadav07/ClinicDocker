# Deployment Guide - Clinic Management System

## Overview
This guide provides comprehensive instructions for deploying the Clinic Management System in various environments, from local development to production deployment using Docker and Kubernetes.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Deployment](#docker-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Production Deployment](#production-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Backup and Recovery](#backup-and-recovery)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **CPU**: Minimum 4 cores, Recommended 8+ cores
- **RAM**: Minimum 8GB, Recommended 16GB+
- **Storage**: Minimum 50GB free space
- **Network**: Stable internet connection for service discovery

### Software Requirements
- **Java**: OpenJDK 17 or higher
- **Node.js**: Version 16 or higher
- **MySQL**: Version 8.0 or higher
- **Docker**: Version 20.10 or higher (for containerized deployment)
- **Kubernetes**: Version 1.20 or higher (for K8s deployment)
- **Maven**: Version 3.6 or higher

### Development Tools
- **Git**: For source code management
- **IDE**: IntelliJ IDEA, Eclipse, or VS Code
- **Postman**: For API testing
- **MySQL Workbench**: For database management

## Local Development Setup

### 1. Database Setup

#### Install and Configure MySQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# CentOS/RHEL
sudo yum install mysql-server

# macOS (using Homebrew)
brew install mysql

# Windows: Download from MySQL official website
```

#### Create Database and User
```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database
CREATE DATABASE clinic_manager;

-- Create user (optional, for security)
CREATE USER 'clinic_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON clinic_manager.* TO 'clinic_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify database creation
SHOW DATABASES;
USE clinic_manager;
```

### 2. Backend Services Setup

#### Clone Repository
```bash
git clone <repository-url>
cd clinic
```

#### Start Services in Order

##### 1. Eureka Server
```bash
cd eureka-server
mvn clean install
mvn spring-boot:run
# Verify: http://localhost:8761
```

##### 2. User Service
```bash
cd ../user-service
# Update application.properties with database credentials
mvn clean install
mvn spring-boot:run
# Verify: http://localhost:8081/actuator/health
```

##### 3. Patient Service
```bash
cd ../patient-service
mvn clean install
mvn spring-boot:run
# Verify: http://localhost:8082/actuator/health
```

##### 4. Doctor Service
```bash
cd ../doctor-service
mvn clean install
mvn spring-boot:run
# Verify: http://localhost:8083/actuator/health
```

##### 5. Appointment Service
```bash
cd ../appointment-service
mvn clean install
mvn spring-boot:run
# Verify: http://localhost:8085/actuator/health
```

##### 6. API Gateway
```bash
cd ../api-gateway
mvn clean install
mvn spring-boot:run
# Verify: http://localhost:8080/actuator/health
```

### 3. Frontend Setup

#### Install Dependencies and Start
```bash
cd Frontend
npm install
npm start
# Access: http://localhost:3000
```

### 4. Verification
- **Eureka Dashboard**: http://localhost:8761
- **API Gateway Health**: http://localhost:8080/actuator/health
- **Swagger Documentation**: http://localhost:8080/swagger-ui.html
- **Frontend Application**: http://localhost:3000

## Docker Deployment

### 1. Create Docker Network
```bash
docker network create clinic-network
```

### 2. MySQL Container
```bash
docker run -d \
  --name clinic-mysql \
  --network clinic-network \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=clinic_manager \
  -e MYSQL_USER=clinic_user \
  -e MYSQL_PASSWORD=clinic_password \
  -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  mysql:8.0
```

### 3. Build Service Images

#### Create Dockerfiles for Each Service

##### Eureka Server Dockerfile
```dockerfile
FROM openjdk:17-jre-slim
VOLUME /tmp
COPY target/eureka-server-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

##### Microservice Dockerfile Template
```dockerfile
FROM openjdk:17-jre-slim
VOLUME /tmp
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

##### Frontend Dockerfile
```dockerfile
# Multi-stage build
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Build Images
```bash
# Build each service
cd eureka-server
docker build -t clinic/eureka-server:1.0.0 .

cd ../user-service
docker build -t clinic/user-service:1.0.0 .

cd ../patient-service
docker build -t clinic/patient-service:1.0.0 .

cd ../doctor-service
docker build -t clinic/doctor-service:1.0.0 .

cd ../appointment-service
docker build -t clinic/appointment-service:1.0.0 .

cd ../api-gateway
docker build -t clinic/api-gateway:1.0.0 .

cd ../Frontend
docker build -t clinic/frontend:1.0.0 .
```

### 4. Docker Compose Deployment

#### docker-compose.yml
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: clinic-mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: clinic_manager
      MYSQL_USER: clinic_user
      MYSQL_PASSWORD: clinic_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - clinic-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  eureka-server:
    image: clinic/eureka-server:1.0.0
    container_name: eureka-server
    ports:
      - "8761:8761"
    networks:
      - clinic-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8761/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  user-service:
    image: clinic/user-service:1.0.0
    container_name: user-service
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/clinic_manager
      SPRING_DATASOURCE_USERNAME: clinic_user
      SPRING_DATASOURCE_PASSWORD: clinic_password
      EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE: http://eureka-server:8761/eureka
    ports:
      - "8081:8081"
    depends_on:
      - mysql
      - eureka-server
    networks:
      - clinic-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8081/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  patient-service:
    image: clinic/patient-service:1.0.0
    container_name: patient-service
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/clinic_manager
      SPRING_DATASOURCE_USERNAME: clinic_user
      SPRING_DATASOURCE_PASSWORD: clinic_password
      EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE: http://eureka-server:8761/eureka
      USER_SERVICE_URL: http://user-service:8081/api/users
    ports:
      - "8082:8082"
    depends_on:
      - mysql
      - eureka-server
      - user-service
    networks:
      - clinic-network

  doctor-service:
    image: clinic/doctor-service:1.0.0
    container_name: doctor-service
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/clinic_manager
      SPRING_DATASOURCE_USERNAME: clinic_user
      SPRING_DATASOURCE_PASSWORD: clinic_password
      EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE: http://eureka-server:8761/eureka
      USER_SERVICE_URL: http://user-service:8081/api/users
      PATIENT_SERVICE_URL: http://patient-service:8082/api/patients
    ports:
      - "8083:8083"
    depends_on:
      - mysql
      - eureka-server
      - user-service
    networks:
      - clinic-network

  appointment-service:
    image: clinic/appointment-service:1.0.0
    container_name: appointment-service
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/clinic_manager
      SPRING_DATASOURCE_USERNAME: clinic_user
      SPRING_DATASOURCE_PASSWORD: clinic_password
      EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE: http://eureka-server:8761/eureka
      USER_SERVICE_URL: http://user-service:8081/api/users
      DOCTOR_SERVICE_URL: http://doctor-service:8083/api/doctors
    ports:
      - "8085:8085"
    depends_on:
      - mysql
      - eureka-server
      - user-service
      - doctor-service
    networks:
      - clinic-network

  api-gateway:
    image: clinic/api-gateway:1.0.0
    container_name: api-gateway
    environment:
      EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE: http://eureka-server:8761/eureka
    ports:
      - "8080:8080"
    depends_on:
      - eureka-server
      - user-service
      - patient-service
      - doctor-service
      - appointment-service
    networks:
      - clinic-network

  frontend:
    image: clinic/frontend:1.0.0
    container_name: clinic-frontend
    ports:
      - "3000:80"
    depends_on:
      - api-gateway
    networks:
      - clinic-network

volumes:
  mysql_data:

networks:
  clinic-network:
    driver: bridge
```

#### Deploy with Docker Compose
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Kubernetes Deployment

### 1. Prerequisites
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Verify installation
kubectl version --client
```

### 2. Create Namespace
```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: clinic-system
```

```bash
kubectl apply -f namespace.yaml
```

### 3. ConfigMaps and Secrets

#### Database Secret
```yaml
# mysql-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: mysql-secret
  namespace: clinic-system
type: Opaque
data:
  root-password: cm9vdHBhc3N3b3Jk  # base64 encoded 'rootpassword'
  username: Y2xpbmljX3VzZXI=        # base64 encoded 'clinic_user'
  password: Y2xpbmljX3Bhc3N3b3Jk    # base64 encoded 'clinic_password'
```

#### Application ConfigMap
```yaml
# app-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: clinic-system
data:
  eureka.url: "http://eureka-server:8761/eureka"
  mysql.url: "jdbc:mysql://mysql:3306/clinic_manager"
  jwt.secret: "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e"
```

### 4. Database Deployment

#### MySQL StatefulSet
```yaml
# mysql-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
  namespace: clinic-system
spec:
  serviceName: mysql
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: root-password
        - name: MYSQL_DATABASE
          value: clinic_manager
        - name: MYSQL_USER
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: username
        - name: MYSQL_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: password
        ports:
        - containerPort: 3306
        volumeMounts:
        - name: mysql-storage
          mountPath: /var/lib/mysql
  volumeClaimTemplates:
  - metadata:
      name: mysql-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
---
apiVersion: v1
kind: Service
metadata:
  name: mysql
  namespace: clinic-system
spec:
  selector:
    app: mysql
  ports:
  - port: 3306
    targetPort: 3306
  clusterIP: None
```

### 5. Microservices Deployment

#### Eureka Server
```yaml
# eureka-server.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: eureka-server
  namespace: clinic-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: eureka-server
  template:
    metadata:
      labels:
        app: eureka-server
    spec:
      containers:
      - name: eureka-server
        image: clinic/eureka-server:1.0.0
        ports:
        - containerPort: 8761
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8761
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /actuator/health
            port: 8761
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: eureka-server
  namespace: clinic-system
spec:
  selector:
    app: eureka-server
  ports:
  - port: 8761
    targetPort: 8761
```

#### User Service
```yaml
# user-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  namespace: clinic-system
spec:
  replicas: 2
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: clinic/user-service:1.0.0
        ports:
        - containerPort: 8081
        env:
        - name: SPRING_DATASOURCE_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: mysql.url
        - name: SPRING_DATASOURCE_USERNAME
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: username
        - name: SPRING_DATASOURCE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: password
        - name: EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: eureka.url
        - name: JWT_SECRET
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: jwt.secret
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8081
          initialDelaySeconds: 120
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /actuator/health
            port: 8081
          initialDelaySeconds: 60
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: user-service
  namespace: clinic-system
spec:
  selector:
    app: user-service
  ports:
  - port: 8081
    targetPort: 8081
```

### 6. Ingress Configuration

#### Nginx Ingress
```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: clinic-ingress
  namespace: clinic-system
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  rules:
  - host: clinic.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 8080
```

### 7. Deploy to Kubernetes
```bash
# Apply all configurations
kubectl apply -f namespace.yaml
kubectl apply -f mysql-secret.yaml
kubectl apply -f app-config.yaml
kubectl apply -f mysql-statefulset.yaml
kubectl apply -f eureka-server.yaml
kubectl apply -f user-service.yaml
# ... apply other services
kubectl apply -f ingress.yaml

# Check deployment status
kubectl get pods -n clinic-system
kubectl get services -n clinic-system
kubectl get ingress -n clinic-system

# View logs
kubectl logs -f deployment/user-service -n clinic-system
```

## Production Deployment

### 1. Infrastructure Requirements

#### Minimum Production Setup
- **Load Balancer**: Nginx or HAProxy
- **Application Servers**: 3+ nodes for high availability
- **Database**: MySQL cluster or managed database service
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)

#### Recommended Production Setup
- **Container Orchestration**: Kubernetes cluster
- **Service Mesh**: Istio for advanced traffic management
- **CI/CD Pipeline**: Jenkins, GitLab CI, or GitHub Actions
- **Security**: Vault for secrets management
- **Backup**: Automated database and configuration backups

### 2. Security Hardening

#### SSL/TLS Configuration
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name clinic.yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    location / {
        proxy_pass http://frontend-service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://api-gateway-service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Database Security
```sql
-- Create dedicated database users
CREATE USER 'clinic_app'@'%' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON clinic_manager.* TO 'clinic_app'@'%';

-- Enable SSL
SET GLOBAL require_secure_transport = ON;

-- Configure firewall rules
-- Only allow connections from application servers
```

### 3. Performance Optimization

#### JVM Tuning
```bash
# Production JVM settings
JAVA_OPTS="-Xms2g -Xmx4g -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+HeapDumpOnOutOfMemoryError"
```

#### Database Optimization
```sql
-- MySQL configuration for production
[mysqld]
innodb_buffer_pool_size = 4G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
query_cache_size = 256M
max_connections = 500
```

## Environment Configuration

### 1. Environment Variables

#### Development
```bash
export SPRING_PROFILES_ACTIVE=development
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=clinic_manager
export DB_USERNAME=root
export DB_PASSWORD=password
export EUREKA_URL=http://localhost:8761/eureka
export JWT_SECRET=development_secret_key
```

#### Staging
```bash
export SPRING_PROFILES_ACTIVE=staging
export DB_HOST=staging-db.internal
export DB_PORT=3306
export DB_NAME=clinic_manager_staging
export DB_USERNAME=clinic_staging_user
export DB_PASSWORD=staging_secure_password
export EUREKA_URL=http://eureka-staging.internal:8761/eureka
export JWT_SECRET=staging_secret_key
```

#### Production
```bash
export SPRING_PROFILES_ACTIVE=production
export DB_HOST=prod-db-cluster.internal
export DB_PORT=3306
export DB_NAME=clinic_manager_prod
export DB_USERNAME=clinic_prod_user
export DB_PASSWORD=production_very_secure_password
export EUREKA_URL=http://eureka-prod.internal:8761/eureka
export JWT_SECRET=production_secret_key_very_long_and_secure
```

### 2. Configuration Files

#### application-production.properties
```properties
# Production configuration
spring.profiles.active=production

# Database configuration
spring.datasource.url=jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}?useSSL=true&requireSSL=true
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5

# JPA configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Logging configuration
logging.level.org.springframework=WARN
logging.level.com.clinic=INFO
logging.file.name=/var/log/clinic/application.log
logging.file.max-size=100MB
logging.file.max-history=30

# Security configuration
jwt.secret=${JWT_SECRET}
jwt.expiration=3600000

# Actuator configuration
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=when-authorized
```

## Monitoring and Logging

### 1. Prometheus Configuration

#### prometheus.yml
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'clinic-services'
    static_configs:
      - targets: 
        - 'user-service:8081'
        - 'patient-service:8082'
        - 'doctor-service:8083'
        - 'appointment-service:8085'
        - 'api-gateway:8080'
    metrics_path: '/actuator/prometheus'
```

### 2. Grafana Dashboard

#### Service Metrics Dashboard
```json
{
  "dashboard": {
    "title": "Clinic Management System",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{service}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      }
    ]
  }
}
```

### 3. ELK Stack Configuration

#### Logstash Configuration
```ruby
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] {
    mutate {
      add_field => { "service_name" => "%{[fields][service]}" }
    }
  }
  
  grok {
    match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} \[%{DATA:thread}\] %{LOGLEVEL:level} %{DATA:logger} - %{GREEDYDATA:log_message}" }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "clinic-logs-%{+YYYY.MM.dd}"
  }
}
```

## Backup and Recovery

### 1. Database Backup

#### Automated Backup Script
```bash
#!/bin/bash
# backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mysql"
DB_NAME="clinic_manager"
DB_USER="backup_user"
DB_PASS="backup_password"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
mysqldump -u$DB_USER -p$DB_PASS --single-transaction --routines --triggers $DB_NAME > $BACKUP_DIR/clinic_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/clinic_backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: clinic_backup_$DATE.sql.gz"
```

#### Cron Job Setup
```bash
# Add to crontab
0 2 * * * /path/to/backup-database.sh >> /var/log/backup.log 2>&1
```

### 2. Application Configuration Backup

#### Kubernetes Backup
```bash
#!/bin/bash
# backup-k8s-config.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/k8s"

mkdir -p $BACKUP_DIR

# Backup all resources in clinic-system namespace
kubectl get all,configmaps,secrets,pvc -n clinic-system -o yaml > $BACKUP_DIR/clinic-k8s-backup_$DATE.yaml

# Compress backup
gzip $BACKUP_DIR/clinic-k8s-backup_$DATE.yaml

echo "Kubernetes configuration backup completed"
```

### 3. Recovery Procedures

#### Database Recovery
```bash
# Stop application services
docker-compose stop user-service patient-service doctor-service appointment-service

# Restore database
gunzip -c /backup/mysql/clinic_backup_20250115_020000.sql.gz | mysql -u root -p clinic_manager

# Start services
docker-compose start user-service patient-service doctor-service appointment-service
```

#### Kubernetes Recovery
```bash
# Apply backup configuration
kubectl apply -f /backup/k8s/clinic-k8s-backup_20250115_020000.yaml
```

## Troubleshooting

### 1. Common Issues

#### Service Discovery Issues
```bash
# Check Eureka server status
curl http://eureka-server:8761/eureka/apps

# Verify service registration
kubectl logs deployment/user-service -n clinic-system | grep -i eureka

# Check network connectivity
kubectl exec -it user-service-pod -- nslookup eureka-server
```

#### Database Connection Issues
```bash
# Test database connectivity
kubectl exec -it mysql-pod -- mysql -u clinic_user -p -e "SELECT 1"

# Check database logs
kubectl logs statefulset/mysql -n clinic-system

# Verify credentials
kubectl get secret mysql-secret -n clinic-system -o yaml
```

#### Memory Issues
```bash
# Check memory usage
kubectl top pods -n clinic-system

# View JVM memory usage
kubectl exec -it user-service-pod -- jstat -gc 1

# Increase memory limits
kubectl patch deployment user-service -n clinic-system -p '{"spec":{"template":{"spec":{"containers":[{"name":"user-service","resources":{"limits":{"memory":"2Gi"}}}]}}}}'
```

### 2. Performance Issues

#### Slow Database Queries
```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Check slow queries
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;

-- Analyze query performance
EXPLAIN SELECT * FROM appointments WHERE patient_id = 1;
```

#### High CPU Usage
```bash
# Check CPU usage
kubectl top pods -n clinic-system

# Profile application
kubectl exec -it user-service-pod -- jstack 1

# Scale deployment
kubectl scale deployment user-service --replicas=3 -n clinic-system
```

### 3. Network Issues

#### Service Communication Problems
```bash
# Test service connectivity
kubectl exec -it user-service-pod -- curl http://patient-service:8082/actuator/health

# Check service endpoints
kubectl get endpoints -n clinic-system

# Verify DNS resolution
kubectl exec -it user-service-pod -- nslookup patient-service
```

### 4. Debugging Commands

#### Kubernetes Debugging
```bash
# Get pod status
kubectl get pods -n clinic-system -o wide

# Describe problematic pod
kubectl describe pod user-service-pod -n clinic-system

# View pod logs
kubectl logs user-service-pod -n clinic-system --previous

# Execute commands in pod
kubectl exec -it user-service-pod -n clinic-system -- /bin/bash

# Port forward for local debugging
kubectl port-forward service/user-service 8081:8081 -n clinic-system
```

#### Docker Debugging
```bash
# Check container status
docker ps -a

# View container logs
docker logs user-service --tail 100 -f

# Execute commands in container
docker exec -it user-service /bin/bash

# Inspect container
docker inspect user-service
```

## Security Checklist

### 1. Pre-deployment Security
- [ ] Update all dependencies to latest versions
- [ ] Scan images for vulnerabilities
- [ ] Configure proper RBAC in Kubernetes
- [ ] Set up network policies
- [ ] Enable audit logging
- [ ] Configure secrets management
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules

### 2. Runtime Security
- [ ] Monitor for security events
- [ ] Regular security scans
- [ ] Update security patches
- [ ] Review access logs
- [ ] Monitor resource usage
- [ ] Check for unauthorized access
- [ ] Validate data integrity
- [ ] Test backup and recovery

---

**Deployment Guide Version**: 1.0.0
**Last Updated**: January 2025
**Maintainer**: Development Team