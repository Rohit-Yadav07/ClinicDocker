# User Service Documentation

## Overview
The User Service is the authentication and authorization microservice in the Clinic Management System. It handles user registration, login, JWT token management, and role-based access control.

## Service Configuration
- **Port**: 8081
- **Database**: MySQL (clinic_manager)
- **Service Discovery**: Eureka Client
- **Security**: JWT-based authentication

## Architecture

### Package Structure
```
com.user_service/
├── config/                 # Configuration classes
│   ├── CorsConfig.java    # CORS configuration
│   ├── JwtAuthenticationFilter.java # JWT filter
│   ├── SecurityConfig.java # Spring Security configuration
│   └── SwaggerSecurityConfig.java # Swagger security
├── controller/            # REST controllers
│   ├── AuthController.java # Authentication endpoints
│   └── UserController.java # User management endpoints
├── entity/               # JPA entities
│   ├── Role.java         # User role enumeration
│   └── User.java         # User entity
├── exception/            # Exception handling
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   └── UnauthorizedException.java
├── repository/           # Data access layer
│   └── UserRepository.java
├── service/             # Business logic
│   └── UserService.java
├── util/                # Utility classes
│   └── JwtUtil.java     # JWT token utilities
└── UserServiceApplication.java # Main application class
```

## Entities

### User Entity
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
```

### Role Enumeration
```java
public enum Role {
    PATIENT,
    DOCTOR,
    ADMIN
}
```

## API Endpoints

### Authentication Controller (`/api/auth`)

#### POST /api/auth/register
**Description**: Register a new user
**Request Body**:
```json
{
    "username": "string",
    "password": "string",
    "email": "string",
    "role": "PATIENT|DOCTOR"
}
```
**Response**:
```json
{
    "message": "User registered successfully",
    "userId": 1
}
```

#### POST /api/auth/login
**Description**: Authenticate user and return JWT token
**Request Body**:
```json
{
    "username": "string",
    "password": "string"
}
```
**Response**:
```json
{
    "token": "jwt_token_string",
    "user": {
        "id": 1,
        "username": "string",
        "email": "string",
        "role": "PATIENT"
    }
}
```

### User Controller (`/api/users`)

#### GET /api/users/me
**Description**: Get current authenticated user profile
**Headers**: `Authorization: Bearer <token>`
**Response**:
```json
{
    "id": 1,
    "username": "string",
    "email": "string",
    "role": "PATIENT",
    "createdAt": "2025-01-01T10:00:00"
}
```

#### PUT /api/users/me
**Description**: Update current user profile
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
    "email": "new_email@example.com"
}
```

#### GET /api/users/{id}
**Description**: Get user by ID (Admin only)
**Headers**: `Authorization: Bearer <token>`
**Response**: User object

## Security Configuration

### JWT Configuration
```properties
jwt.secret=cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e
jwt.expiration=86400000  # 24 hours in milliseconds
```

### Security Features
- **Password Encoding**: BCrypt with strength 12
- **JWT Token**: HMAC SHA-256 algorithm
- **CORS**: Configured for frontend integration
- **Session Management**: Stateless
- **CSRF Protection**: Disabled for API

### Protected Endpoints
- All `/api/users/**` endpoints require authentication
- Role-based access control implemented
- JWT token validation on each request

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('PATIENT', 'DOCTOR', 'ADMIN') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Service Dependencies

### Internal Dependencies
- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- Spring Boot Starter Security
- Spring Cloud Starter Netflix Eureka Client
- MySQL Connector

### External Dependencies
- **JWT Library**: io.jsonwebtoken (jjwt)
- **Lombok**: Code generation
- **SpringDoc**: API documentation

## Configuration Files

### application.properties
```properties
# Server Configuration
spring.application.name=user-service
server.port=8081

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/clinic_manager?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=rohit
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# JWT Configuration
jwt.secret=<secret_key>
jwt.expiration=86400000

# Eureka Configuration
eureka.client.service-url.defaultZone=http://localhost:8761/eureka
eureka.client.register-with-eureka=true
eureka.client.fetch-registry=true

# Logging Configuration
logging.level.org.springframework=INFO
logging.level.com.clinicmanager=DEBUG
logging.file.name=logs/user-service.log
```

## Error Handling

### Custom Exceptions
- **ResourceNotFoundException**: When user not found
- **UnauthorizedException**: Authentication/authorization failures
- **ValidationException**: Input validation errors

### Global Exception Handler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        // Handle resource not found
    }
    
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex) {
        // Handle unauthorized access
    }
}
```

## Testing

### Unit Tests
- **UserServiceTest**: Business logic testing
- **AuthControllerTest**: Authentication endpoint testing
- **UserControllerTest**: User management endpoint testing
- **JwtUtilTest**: JWT utility testing

### Integration Tests
- **UserServiceIntegrationTest**: Full service integration
- **SecurityConfigTest**: Security configuration testing

### Test Configuration
```properties
# Test Database (H2)
spring.datasource.url=jdbc:h2:mem:testdb
spring.jpa.hibernate.ddl-auto=create-drop
spring.h2.console.enabled=true
```

## Monitoring and Logging

### Logging Configuration
- **Log Level**: INFO for Spring, DEBUG for application
- **Log File**: `logs/user-service.log`
- **Log Pattern**: Timestamp, level, class, message
- **Log Rotation**: Daily with compression

### Health Checks
- **Actuator Endpoints**: `/actuator/health`, `/actuator/info`
- **Database Health**: Automatic JPA health indicator
- **Eureka Health**: Service registration status

## Performance Considerations

### Database Optimization
- **Indexes**: Username and email columns
- **Connection Pooling**: HikariCP (default)
- **Query Optimization**: JPA query optimization

### Security Performance
- **Password Hashing**: BCrypt with appropriate strength
- **JWT Token**: Stateless authentication
- **Session Management**: No server-side sessions

## Deployment

### Environment Variables
```bash
export DB_URL=jdbc:mysql://localhost:3306/clinic_manager
export DB_USERNAME=clinic_user
export DB_PASSWORD=secure_password
export JWT_SECRET=your_jwt_secret_key
export EUREKA_URL=http://eureka-server:8761/eureka
```

### Docker Configuration
```dockerfile
FROM openjdk:17-jre-slim
COPY target/user-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check MySQL server status
   - Verify credentials in application.properties
   - Ensure database exists

2. **JWT Token Issues**
   - Verify secret key configuration
   - Check token expiration settings
   - Validate token format

3. **Eureka Registration Issues**
   - Ensure Eureka server is running
   - Check network connectivity
   - Verify service name configuration

### Debug Commands
```bash
# Check service health
curl http://localhost:8081/actuator/health

# Test authentication
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"password"}'

# Check Eureka registration
curl http://localhost:8761/eureka/apps/USER-SERVICE
```

## API Documentation
- **Swagger UI**: http://localhost:8081/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8081/v3/api-docs

## Future Enhancements

### Planned Features
- **Multi-factor Authentication**: SMS/Email verification
- **OAuth2 Integration**: Social login support
- **Password Reset**: Email-based password reset
- **Account Lockout**: Brute force protection
- **Audit Logging**: User activity tracking

### Technical Improvements
- **Redis Integration**: Token blacklisting
- **Rate Limiting**: API rate limiting
- **Metrics Collection**: Detailed performance metrics
- **Circuit Breaker**: Resilience patterns

---

**Service Version**: 1.0.0
**Last Updated**: January 2025
**Maintainer**: Development Team