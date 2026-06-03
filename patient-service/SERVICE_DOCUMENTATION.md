# Patient Service Documentation

## Overview
The Patient Service manages patient profiles, medical history, and health-related information in the Clinic Management System. It provides comprehensive patient data management with secure access control and integration with other services.

## Service Configuration
- **Port**: 8082
- **Database**: MySQL (clinic_manager)
- **Service Discovery**: Eureka Client
- **Security**: JWT-based authentication
- **Inter-service Communication**: OpenFeign

## Architecture

### Package Structure
```
com.patient_service/
├── config/                    # Configuration classes
│   ├── CorsConfig.java       # CORS configuration
│   ├── JwtAuthenticationFilter.java # JWT authentication filter
│   ├── SecurityConfig.java   # Spring Security setup
│   └── SwaggerSecurityConfig.java # Swagger security
├── controller/               # REST controllers
│   └── PatientController.java # Patient management endpoints
├── entity/                   # JPA entities
│   ├── MedicalHistory.java   # Medical history records
│   └── Patient.java          # Patient profile entity
├── exception/                # Exception handling
│   ├── ResourceNotFoundException.java
│   └── UnauthorizedException.java
├── feign/                    # Feign clients
│   └── UserServiceClient.java # User service integration
├── repository/               # Data access layer
│   ├── MedicalHistoryRepository.java
│   └── PatientRepository.java
├── service/                  # Business logic
│   └── PatientService.java
├── util/                     # Utility classes
│   └── JwtUtil.java          # JWT token utilities
└── PatientServiceApplication.java # Main application class
```

## Entities

### Patient Entity
```java
@Entity
@Table(name = "patients")
public class Patient {
    @Id
    private Long userId;  // References User.id from User Service
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    private LocalDate dateOfBirth;
    
    @Enumerated(EnumType.STRING)
    private Gender gender;
    
    private String contactNumber;
    private String address;
    private String bloodType;
    private String emergencyContactName;
    private String emergencyContactNumber;
    private String insuranceProvider;
    private String insurancePolicyNumber;
    
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<MedicalHistory> medicalHistory;
}

enum Gender {
    MALE, FEMALE, OTHER
}
```

### Medical History Entity
```java
@Entity
@Table(name = "medical_history")
public class MedicalHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonBackReference
    private Patient patient;
    
    @Column(nullable = false)
    private String description;
    
    private LocalDateTime recordedAt;
}
```

## API Endpoints

### Patient Controller (`/api/patients`)

#### GET /api/patients/me
**Description**: Get current patient's profile
**Headers**: `Authorization: Bearer <token>`
**Response**:
```json
{
    "userId": 1,
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "gender": "MALE",
    "contactNumber": "+1234567890",
    "address": "123 Main St, City, State",
    "bloodType": "O+",
    "emergencyContactName": "Jane Doe",
    "emergencyContactNumber": "+1234567891",
    "insuranceProvider": "Health Insurance Co",
    "insurancePolicyNumber": "POL123456789",
    "medicalHistory": [...]
}
```

#### PUT /api/patients/me
**Description**: Update current patient's profile
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "gender": "MALE",
    "contactNumber": "+1234567890",
    "address": "123 Main St, City, State",
    "bloodType": "O+",
    "insuranceProvider": "Health Insurance Co",
    "insurancePolicyNumber": "POL123456789"
}
```

#### POST /api/patients/me/emergency-contact
**Description**: Update emergency contact information
**Headers**: `Authorization: Bearer <token>`
**Parameters**:
- `name` (String): Emergency contact name
- `number` (String): Emergency contact phone number

#### GET /api/patients/me/medical-history
**Description**: Get patient's medical history
**Headers**: `Authorization: Bearer <token>`
**Response**:
```json
[
    {
        "id": 1,
        "description": "Annual checkup - all normal",
        "recordedAt": "2024-01-15T10:30:00"
    },
    {
        "id": 2,
        "description": "Flu vaccination administered",
        "recordedAt": "2024-02-01T14:15:00"
    }
]
```

#### POST /api/patients/me/medical-history
**Description**: Add new medical history record
**Headers**: `Authorization: Bearer <token>`
**Parameters**:
- `description` (String): Medical history description
**Response**:
```json
{
    "id": 3,
    "description": "Blood pressure check - 120/80",
    "recordedAt": "2025-01-15T09:45:00"
}
```

#### GET /api/patients/me/summary
**Description**: Get patient summary for doctors
**Headers**: `Authorization: Bearer <token>`
**Response**:
```json
{
    "patientId": 1,
    "fullName": "John Doe",
    "age": 35,
    "gender": "MALE",
    "bloodType": "O+",
    "contactNumber": "+1234567890",
    "emergencyContact": {
        "name": "Jane Doe",
        "number": "+1234567891"
    },
    "recentMedicalHistory": [...]
}
```

#### GET /api/patients/me/patients (Doctor Access)
**Description**: Get all patients (for doctors only)
**Headers**: `Authorization: Bearer <token>`
**Access**: DOCTOR role required
**Response**: Array of patient summaries

## Database Schema

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

## Service Integration

### User Service Integration
```java
@FeignClient(name = "user-service", url = "${user.service.url}")
public interface UserServiceClient {
    
    @GetMapping("/{userId}")
    UserDTO getUserById(@PathVariable Long userId);
    
    @GetMapping("/me")
    UserDTO getCurrentUser(@RequestHeader("Authorization") String token);
}
```

### Integration Points
- **User Validation**: Validates user existence before patient operations
- **Role Verification**: Ensures proper access control
- **Profile Synchronization**: Maintains consistency with user data

## Security Configuration

### JWT Authentication
- **Token Validation**: Every request validates JWT token
- **User Context**: Extracts user information from token
- **Role-based Access**: Different access levels for patients and doctors

### Access Control
- **Patient Access**: Users can only access their own data
- **Doctor Access**: Doctors can access patient summaries and medical history
- **Admin Access**: Full access to all patient data

### CORS Configuration
```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        return source;
    }
}
```

## Business Logic

### Patient Service Implementation
```java
@Service
@Transactional
public class PatientService {
    
    public Patient getPatientProfile(Long userId) {
        return patientRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
    }
    
    public Patient updatePatientProfile(Long userId, Patient patientData) {
        Patient existingPatient = getPatientProfile(userId);
        // Update fields
        return patientRepository.save(existingPatient);
    }
    
    public MedicalHistory addMedicalHistory(Long userId, String description) {
        Patient patient = getPatientProfile(userId);
        MedicalHistory history = new MedicalHistory();
        history.setPatient(patient);
        history.setDescription(description);
        history.setRecordedAt(LocalDateTime.now());
        return medicalHistoryRepository.save(history);
    }
}
```

## Configuration Files

### application.properties
```properties
# Service Configuration
spring.application.name=patient-service
server.port=8082

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
jwt.secret=cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e
jwt.expiration=86400000

# Service URLs
user.service.url=http://localhost:8081/api/users

# Eureka Configuration
eureka.client.service-url.defaultZone=http://localhost:8761/eureka
eureka.client.register-with-eureka=true
eureka.client.fetch-registry=true

# Logging Configuration
logging.level.org.springframework=INFO
logging.level.com.clinicmanager=DEBUG
logging.file.name=logs/patient-service.log
```

## Error Handling

### Custom Exceptions
```java
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
```

### Global Exception Handler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        ErrorResponse error = new ErrorResponse("RESOURCE_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex) {
        ErrorResponse error = new ErrorResponse("UNAUTHORIZED", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
}
```

## Data Validation

### Input Validation
```java
@Valid
public class PatientUpdateRequest {
    @NotBlank(message = "First name is required")
    @Size(max = 255, message = "First name must not exceed 255 characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(max = 255, message = "Last name must not exceed 255 characters")
    private String lastName;
    
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;
    
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    private String contactNumber;
    
    @Email(message = "Invalid email format")
    private String email;
}
```

## Testing

### Unit Tests
```java
@ExtendWith(MockitoExtension.class)
class PatientServiceTest {
    
    @Mock
    private PatientRepository patientRepository;
    
    @Mock
    private MedicalHistoryRepository medicalHistoryRepository;
    
    @InjectMocks
    private PatientService patientService;
    
    @Test
    void testGetPatientProfile() {
        // Test implementation
    }
    
    @Test
    void testAddMedicalHistory() {
        // Test implementation
    }
}
```

### Integration Tests
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class PatientControllerIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void testGetPatientProfile() {
        // Integration test implementation
    }
}
```

## Performance Optimization

### Database Optimization
- **Lazy Loading**: Medical history loaded on demand
- **Indexing**: Indexes on userId and frequently queried fields
- **Connection Pooling**: HikariCP configuration

### Caching Strategy
```java
@Cacheable(value = "patients", key = "#userId")
public Patient getPatientProfile(Long userId) {
    return patientRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
}

@CacheEvict(value = "patients", key = "#userId")
public Patient updatePatientProfile(Long userId, Patient patientData) {
    // Update implementation
}
```

## Monitoring and Logging

### Logging Configuration
```properties
# Logging levels
logging.level.com.patient_service=DEBUG
logging.level.org.springframework.web=INFO
logging.level.org.hibernate.SQL=DEBUG

# Log file configuration
logging.file.name=logs/patient-service.log
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
```

### Health Checks
- **Database Health**: JPA health indicator
- **Service Dependencies**: User service connectivity
- **Custom Health Indicators**: Medical history data integrity

## Deployment

### Docker Configuration
```dockerfile
FROM openjdk:17-jre-slim
VOLUME /tmp
COPY target/patient-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Environment Variables
```bash
export DB_URL=jdbc:mysql://mysql-server:3306/clinic_manager
export DB_USERNAME=patient_service_user
export DB_PASSWORD=secure_password
export JWT_SECRET=your_jwt_secret
export USER_SERVICE_URL=http://user-service:8081/api/users
export EUREKA_URL=http://eureka-server:8761/eureka
```

## API Documentation
- **Swagger UI**: http://localhost:8082/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8082/v3/api-docs

## Troubleshooting

### Common Issues

1. **Patient Not Found Errors**
   - Verify user exists in User Service
   - Check JWT token validity
   - Ensure proper user ID mapping

2. **Medical History Access Issues**
   - Verify patient-medical history relationship
   - Check database foreign key constraints
   - Validate user permissions

3. **Service Communication Issues**
   - Check User Service availability
   - Verify Feign client configuration
   - Test network connectivity

### Debug Commands
```bash
# Check service health
curl http://localhost:8082/actuator/health

# Test patient profile access
curl -H "Authorization: Bearer <token>" \
     http://localhost:8082/api/patients/me

# Check medical history
curl -H "Authorization: Bearer <token>" \
     http://localhost:8082/api/patients/me/medical-history
```

## Future Enhancements

### Planned Features
- **Medical Document Upload**: File attachment support
- **Allergy Management**: Comprehensive allergy tracking
- **Medication History**: Prescription and medication tracking
- **Family Medical History**: Genetic and family health information
- **Health Metrics**: Vital signs and health measurements

### Technical Improvements
- **Event Sourcing**: Medical history event tracking
- **GDPR Compliance**: Data privacy and deletion capabilities
- **Audit Trail**: Complete audit logging
- **Data Encryption**: Sensitive data encryption at rest

---

**Service Version**: 1.0.0
**Last Updated**: January 2025
**Maintainer**: Development Team