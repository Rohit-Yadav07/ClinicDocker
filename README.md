# Clinic Management System

## Overview

The Clinic Management System is a comprehensive microservices-based healthcare application built with Spring Boot and React. It provides a complete solution for managing patients, doctors, appointments, and medical records in a clinical environment.

## Architecture

### System Architecture
The system follows a microservices architecture pattern with the following components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │ Eureka Server   │
│   (React)       │◄──►│   (Port 8080)   │    │   (Port 8761)   │
│   (Port 3000)   │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────────────────┐
        │                 Microservices                         │
        ├─────────────────┬─────────────────┬─────────────────┬─┤
        │  User Service   │ Patient Service │ Doctor Service  │A│
        │   (Port 8081)   │   (Port 8082)   │   (Port 8083)   │p│
        └─────────────────┴─────────────────┴─────────────────┴p│
                                                                │o│
        ┌─────────────────────────────────────────────────────┤i│
        │           Appointment Service                       │n│
        │              (Port 8085)                           │t│
        └─────────────────────────────────────────────────────┴─┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │   MySQL Database    │
                    │   clinic_manager    │
                    └─────────────────────┘
```

### Technology Stack

#### Backend
- **Framework**: Spring Boot 3.4.5
- **Java Version**: 17/21
- **Database**: MySQL 8.0
- **Service Discovery**: Netflix Eureka
- **API Gateway**: Spring Cloud Gateway
- **Security**: Spring Security with JWT
- **Documentation**: SpringDoc OpenAPI 3
- **Build Tool**: Maven
- **Additional Libraries**:
  - Lombok for boilerplate code reduction
  - OpenFeign for inter-service communication
  - Spring Data JPA for database operations

#### Frontend
- **Framework**: React 18.2.0
- **UI Library**: Material-UI (MUI) 5.15.16
- **Routing**: React Router DOM 6.23.1
- **HTTP Client**: Axios 1.6.8
- **Animation**: Framer Motion 11.0.17
- **Build Tool**: Create React App

## Services Overview

### 1. Eureka Server (Port 8761)
**Purpose**: Service discovery and registration
- Manages service registry for all microservices
- Enables dynamic service discovery
- Provides health monitoring for registered services

### 2. API Gateway (Port 8080)
**Purpose**: Single entry point for all client requests
- Routes requests to appropriate microservices
- Provides centralized authentication and authorization
- Implements load balancing
- Aggregates Swagger documentation from all services

**Key Routes**:
- `/api/users/**`, `/api/auth/**` → User Service
- `/api/patients/**` → Patient Service  
- `/api/doctors/**` → Doctor Service
- `/api/appointments/**` → Appointment Service

### 3. User Service (Port 8081)
**Purpose**: User authentication and authorization
- User registration and login
- JWT token generation and validation
- Role-based access control (PATIENT, DOCTOR)
- User profile management

**Key Entities**:
- `User`: Core user information with roles
- `Role`: User role enumeration

**Key Endpoints**:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/users/me` - Get current user profile

### 4. Patient Service (Port 8082)
**Purpose**: Patient data and medical history management
- Patient profile management
- Medical history tracking
- Emergency contact information
- Insurance details management

**Key Entities**:
- `Patient`: Patient demographic and contact information
- `MedicalHistory`: Patient medical records and history

**Key Endpoints**:
- `GET /api/patients/me` - Get patient profile
- `POST /api/patients/me/medical-history` - Add medical history
- `GET /api/patients/me/medical-history` - Get medical history
- `POST /api/patients/me/emergency-contact` - Update emergency contact

### 5. Doctor Service (Port 8083)
**Purpose**: Doctor profile and availability management
- Doctor profile management
- Specialty and qualification tracking
- Consultation fee management
- Availability scheduling

**Key Entities**:
- `Doctor`: Doctor professional information and credentials

**Key Endpoints**:
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/specialty/{specialty}` - Get doctors by specialty
- `GET /api/doctors/me` - Get doctor profile
- `PUT /api/doctors/me` - Update doctor profile

### 6. Appointment Service (Port 8085)
**Purpose**: Appointment scheduling and management
- Appointment booking and cancellation
- Appointment status tracking
- Schedule management
- Integration with patient and doctor services

**Key Entities**:
- `Appointment`: Appointment details and status

**Key Endpoints**:
- `POST /api/appointments` - Book new appointment
- `GET /api/appointments/me` - Get user appointments
- `PUT /api/appointments/{id}/status` - Update appointment status

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('PATIENT', 'DOCTOR') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Patients Table
```sql
CREATE TABLE patients (
    user_id BIGINT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender ENUM('MALE', 'FEMALE', 'OTHER'),
    contact_number VARCHAR(20),
    address TEXT,
    blood_type VARCHAR(10),
    emergency_contact_name VARCHAR(255),
    emergency_contact_number VARCHAR(20),
    insurance_provider VARCHAR(255),
    insurance_policy_number VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Doctors Table
```sql
CREATE TABLE doctors (
    user_id BIGINT PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    specialty VARCHAR(255),
    consultation_fee DECIMAL(10,2),
    availability TEXT,
    license_number VARCHAR(255),
    qualifications TEXT,
    years_of_experience INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Medical History Table
```sql
CREATE TABLE medical_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    description TEXT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(user_id)
);
```

### Appointments Table
```sql
CREATE TABLE appointments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_time TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    notes TEXT,
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);
```

## Security Implementation

### JWT Authentication
- **Algorithm**: HMAC SHA-256
- **Token Expiration**: 24 hours (86400000 ms)
- **Secret Key**: Configured in application properties
- **Token Structure**: Bearer token in Authorization header

### Security Configuration
- **CORS**: Configured for frontend integration
- **CSRF**: Disabled for stateless JWT authentication
- **Session Management**: Stateless session creation policy
- **Password Encoding**: BCrypt password encoder

### Role-Based Access Control
- **PATIENT**: Access to patient-specific endpoints
- **DOCTOR**: Access to doctor-specific endpoints and patient data
- **Public**: Authentication endpoints

## Frontend Architecture

### Component Structure
```
src/
├── components/           # Reusable UI components
│   ├── Header.js        # Navigation header
│   ├── ThemeToggle.js   # Dark/light mode toggle
│   ├── ProtectedRoute.js # Route protection
│   └── UserProfileCard.js # User profile display
├── pages/               # Page components
│   ├── Login.js         # Authentication page
│   ├── Signup.js        # User registration
│   ├── Home.js          # Patient dashboard
│   ├── DoctorDashboard.js # Doctor dashboard
│   ├── ProfilePage.js   # User profile management
│   ├── AppointmentsPage.js # Appointment management
│   ├── BookAppointmentPage.js # Appointment booking
│   ├── DoctorsPage.js   # Doctor listing
│   ├── MedicalHistoryPage.js # Medical records
│   └── EmergencyContactPage.js # Emergency contacts
├── api.js               # API service layer
├── theme.js             # Material-UI theme configuration
└── App.js               # Main application component
```

### State Management
- **Local State**: React useState for component-level state
- **Global State**: localStorage for user authentication
- **Theme State**: Context-based theme management

### Routing Strategy
- **Role-based routing**: Different routes for patients and doctors
- **Protected routes**: Authentication required for most pages
- **Dynamic navigation**: Menu items based on user role

## Setup and Installation

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- MySQL 8.0
- Maven 3.6+
- Git

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd clinic
```

2. **Database Setup**
```sql
CREATE DATABASE clinic_manager;
CREATE USER 'clinic_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON clinic_manager.* TO 'clinic_user'@'localhost';
FLUSH PRIVILEGES;
```

3. **Update Database Configuration**
Update `application.properties` in each service:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/clinic_manager
spring.datasource.username=your_username
spring.datasource.password=your_password
```

4. **Start Services in Order**
```bash
# 1. Start Eureka Server
cd eureka-server
mvn spring-boot:run

# 2. Start API Gateway
cd ../api-gateway
mvn spring-boot:run

# 3. Start User Service
cd ../user-service
mvn spring-boot:run

# 4. Start Patient Service
cd ../patient-service
mvn spring-boot:run

# 5. Start Doctor Service
cd ../doctor-service
mvn spring-boot:run

# 6. Start Appointment Service
cd ../appointment-service
mvn spring-boot:run
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd Frontend
npm install
```

2. **Start Development Server**
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
- Eureka Dashboard: http://localhost:8761

## API Documentation

### Swagger UI Access
- **Aggregated Documentation**: http://localhost:8080/swagger-ui.html
- **Individual Services**:
  - User Service: http://localhost:8081/swagger-ui.html
  - Patient Service: http://localhost:8082/swagger-ui.html
  - Doctor Service: http://localhost:8083/swagger-ui.html
  - Appointment Service: http://localhost:8085/swagger-ui.html

### Authentication Flow
1. **Registration**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login`
3. **Token Usage**: Include `Authorization: Bearer <token>` in headers
4. **Profile Access**: `GET /api/users/me`

## Configuration Management

### Environment-Specific Configuration
Each service uses `application.properties` for configuration:

**Common Configuration**:
- Server ports
- Database connections
- Eureka client settings
- JWT configuration
- Logging configuration

**Service-Specific Configuration**:
- CORS settings (for services accessed by frontend)
- Feign client configurations
- Service discovery settings

### Logging Configuration
- **Log Files**: Stored in `logs/` directory for each service
- **Log Levels**: Configurable per package
- **Log Rotation**: Automatic daily rotation with compression

## Monitoring and Health Checks

### Eureka Dashboard
- Service registration status
- Health indicators
- Instance information
- Load balancing metrics

### Actuator Endpoints
Available on services with actuator dependency:
- `/actuator/health` - Health status
- `/actuator/info` - Application information
- `/actuator/metrics` - Application metrics

## Development Guidelines

### Code Structure
- **Controller Layer**: REST endpoints and request handling
- **Service Layer**: Business logic implementation
- **Repository Layer**: Data access and persistence
- **Entity Layer**: JPA entities and database mapping
- **Configuration Layer**: Security and application configuration
- **Exception Layer**: Custom exception handling

### Best Practices
- **Separation of Concerns**: Clear layer separation
- **Error Handling**: Comprehensive exception management
- **Security**: JWT-based authentication and authorization
- **Documentation**: Swagger/OpenAPI documentation
- **Testing**: Unit and integration tests
- **Logging**: Structured logging with appropriate levels

## Troubleshooting

### Common Issues

1. **Service Registration Issues**
   - Verify Eureka server is running
   - Check network connectivity
   - Validate service configuration

2. **Database Connection Issues**
   - Verify MySQL server status
   - Check database credentials
   - Ensure database exists

3. **JWT Token Issues**
   - Verify token expiration
   - Check secret key consistency
   - Validate token format

4. **CORS Issues**
   - Verify CORS configuration
   - Check allowed origins
   - Validate request headers

### Logs Location
- **Service Logs**: `<service>/logs/<service-name>.log`
- **Application Logs**: Console output during development
- **Error Logs**: Captured in service-specific log files

## Future Enhancements

### Planned Features
- **Notification System**: Email/SMS notifications for appointments
- **Payment Integration**: Online payment processing
- **Telemedicine**: Video consultation capabilities
- **Mobile Application**: Native mobile app development
- **Analytics Dashboard**: Reporting and analytics features
- **Multi-tenant Support**: Support for multiple clinics

### Technical Improvements
- **Containerization**: Docker and Kubernetes deployment
- **Message Queues**: Asynchronous communication between services
- **Caching**: Redis integration for performance optimization
- **Load Balancing**: Advanced load balancing strategies
- **Monitoring**: Comprehensive monitoring and alerting system

## Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Update documentation
5. Submit pull request

### Code Standards
- Follow Java coding conventions
- Use meaningful variable and method names
- Add comprehensive comments
- Include unit tests for new features
- Update API documentation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section
- Review the API documentation

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintainers**: Development Team