# Doctor Service Documentation

## Overview
The Doctor Service manages doctor profiles, specialties, availability, and provides integration with patient and appointment services. It serves as the central hub for doctor-related operations in the Clinic Management System.

## Service Configuration
- **Port**: 8083
- **Database**: MySQL (clinic_manager)
- **Service Discovery**: Eureka Client
- **Security**: JWT-based authentication
- **Inter-service Communication**: OpenFeign

## Architecture

### Package Structure
```
com.doctor_service/
├── config/                      # Configuration classes
│   ├── CorsConfig.java         # CORS configuration
│   ├── FeignClientConfig.java  # Feign client configuration
│   ├── JwtAuthenticationFilter.java # JWT authentication filter
│   ├── SecurityConfig.java     # Spring Security setup
│   └── SwaggerSecurityConfig.java # Swagger security
├── controller/                 # REST controllers
│   └── DoctorController.java   # Doctor management endpoints
├── DTO/                        # Data Transfer Objects
│   ├── AppointmentDTO/
│   │   └── AppointmentDTO.java # Appointment data transfer
│   └── PatientDTO/
│       ├── MedicalHistoryDTO.java # Medical history transfer
│       └── PatientDTO.java     # Patient data transfer
├── entity/                     # JPA entities
│   └── Doctor.java             # Doctor profile entity
├── exception/                  # Exception handling
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   └── UnauthorizedException.java
├── feign/                      # Feign clients
│   ├── AppointmentServiceClient.java # Appointment service integration
│   ├── PatientServiceClient.java # Patient service integration
│   └── UserServiceClient.java  # User service integration
├── repository/                 # Data access layer
│   └── DoctorRepository.java
├── service/                    # Business logic
│   └── DoctorService.java
├── util/                       # Utility classes
│   └── JwtUtil.java            # JWT token utilities
└── DoctorServiceApplication.java # Main application class
```

## Entities

### Doctor Entity
```java
@Entity
@Table(name = "doctors")
public class Doctor {
    @Id
    private Long userId;  // References User.id from User Service
    
    private String firstName;
    private String lastName;
    private String specialty;
    private Double consultationFee;
    private String availability;
    private String licenseNumber;
    private String qualifications;
    private Integer yearsOfExperience;
}
```

## Data Transfer Objects

### AppointmentDTO
```java
public class AppointmentDTO {
    private Long id;
    private Long patientId;
    private Long doctorId;
    private LocalDateTime appointmentTime;
    private String status;
    private String notes;
    private String patientName;
    private String doctorName;
}
```

### PatientDTO
```java
public class PatientDTO {
    private Long userId;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String gender;
    private String contactNumber;
    private String bloodType;
    private String emergencyContactName;
    private String emergencyContactNumber;
    private List<MedicalHistoryDTO> medicalHistory;
}
```

### MedicalHistoryDTO
```java
public class MedicalHistoryDTO {
    private Long id;
    private String description;
    private LocalDateTime recordedAt;
}
```

## API Endpoints

### Doctor Controller (`/api/doctors`)

#### GET /api/doctors
**Description**: Get all doctors
**Access**: Public
**Response**:
```json
[
    {
        "userId": 1,
        "firstName": "Dr. John",
        "lastName": "Smith",
        "specialty": "Cardiology",
        "consultationFee": 150.00,
        "availability": "Mon-Fri 9AM-5PM",
        "licenseNumber": "MD123456",
        "qualifications": "MD, FACC",
        "yearsOfExperience": 15
    }
]
```

#### GET /api/doctors/{id}
**Description**: Get doctor by ID
**Access**: Public
**Response**: Doctor object

#### GET /api/doctors/specialty/{specialty}
**Description**: Get doctors by specialty
**Access**: Public
**Parameters**:
- `specialty` (String): Medical specialty (e.g., "Cardiology", "Dermatology")
**Response**: Array of doctors with matching specialty

#### GET /api/doctors/me
**Description**: Get current doctor's profile
**Headers**: `Authorization: Bearer <token>`
**Access**: DOCTOR role required
**Response**:
```json
{
    "userId": 1,
    "firstName": "Dr. John",
    "lastName": "Smith",
    "specialty": "Cardiology",
    "consultationFee": 150.00,
    "availability": "Mon-Fri 9AM-5PM",
    "licenseNumber": "MD123456",
    "qualifications": "MD, FACC",
    "yearsOfExperience": 15
}
```

#### PUT /api/doctors/me
**Description**: Update current doctor's profile
**Headers**: `Authorization: Bearer <token>`
**Access**: DOCTOR role required
**Request Body**:
```json
{
    "firstName": "Dr. John",
    "lastName": "Smith",
    "specialty": "Cardiology",
    "consultationFee": 175.00,
    "availability": "Mon-Fri 8AM-6PM",
    "qualifications": "MD, FACC, FSCAI",
    "yearsOfExperience": 16
}
```

#### GET /api/doctors/me/appointments
**Description**: Get doctor's appointments
**Headers**: `Authorization: Bearer <token>`
**Access**: DOCTOR role required
**Response**:
```json
[
    {
        "id": 1,
        "patientId": 2,
        "doctorId": 1,
        "appointmentTime": "2025-01-20T10:00:00",
        "status": "SCHEDULED",
        "notes": "Regular checkup",
        "patientName": "Jane Doe"
    }
]
```

#### GET /api/doctors/me/patients
**Description**: Get doctor's patients
**Headers**: `Authorization: Bearer <token>`
**Access**: DOCTOR role required
**Response**:
```json
[
    {
        "userId": 2,
        "firstName": "Jane",
        "lastName": "Doe",
        "dateOfBirth": "1985-05-15",
        "gender": "FEMALE",
        "contactNumber": "+1234567890",
        "bloodType": "A+",
        "emergencyContactName": "John Doe",
        "emergencyContactNumber": "+1234567891",
        "medicalHistory": [...]
    }
]
```

#### GET /api/doctors/me/patients/{patientId}/medical-history
**Description**: Get specific patient's medical history
**Headers**: `Authorization: Bearer <token>`
**Access**: DOCTOR role required
**Response**: Array of medical history records

## Database Schema

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

### Patient Service Integration
```java
@FeignClient(name = "patient-service", url = "${patient.service.url}")
public interface PatientServiceClient {
    
    @GetMapping("/me/patients")
    List<PatientDTO> getAllPatients(@RequestHeader("Authorization") String token);
    
    @GetMapping("/{patientId}")
    PatientDTO getPatientById(@PathVariable Long patientId, 
                             @RequestHeader("Authorization") String token);
    
    @GetMapping("/{patientId}/medical-history")
    List<MedicalHistoryDTO> getPatientMedicalHistory(@PathVariable Long patientId,
                                                    @RequestHeader("Authorization") String token);
}
```

### Appointment Service Integration
```java
@FeignClient(name = "appointment-service", url = "${appointment.service.url}")
public interface AppointmentServiceClient {
    
    @GetMapping("/doctor/{doctorId}")
    List<AppointmentDTO> getDoctorAppointments(@PathVariable Long doctorId,
                                              @RequestHeader("Authorization") String token);
    
    @PutMapping("/{appointmentId}/status")
    AppointmentDTO updateAppointmentStatus(@PathVariable Long appointmentId,
                                          @RequestParam String status,
                                          @RequestHeader("Authorization") String token);
}
```

## Business Logic

### Doctor Service Implementation
```java
@Service
@Transactional
public class DoctorService {
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private PatientServiceClient patientServiceClient;
    
    @Autowired
    private AppointmentServiceClient appointmentServiceClient;
    
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }
    
    public List<Doctor> getDoctorsBySpecialty(String specialty) {
        return doctorRepository.findBySpecialtyIgnoreCase(specialty);
    }
    
    public Doctor getDoctorProfile(Long userId) {
        return doctorRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
    }
    
    public Doctor updateDoctorProfile(Long userId, Doctor doctorData) {
        Doctor existingDoctor = getDoctorProfile(userId);
        // Update fields
        existingDoctor.setFirstName(doctorData.getFirstName());
        existingDoctor.setLastName(doctorData.getLastName());
        existingDoctor.setSpecialty(doctorData.getSpecialty());
        existingDoctor.setConsultationFee(doctorData.getConsultationFee());
        existingDoctor.setAvailability(doctorData.getAvailability());
        existingDoctor.setQualifications(doctorData.getQualifications());
        existingDoctor.setYearsOfExperience(doctorData.getYearsOfExperience());
        
        return doctorRepository.save(existingDoctor);
    }
    
    public List<AppointmentDTO> getDoctorAppointments(Long doctorId, String token) {
        return appointmentServiceClient.getDoctorAppointments(doctorId, token);
    }
    
    public List<PatientDTO> getDoctorPatients(String token) {
        return patientServiceClient.getAllPatients(token);
    }
}
```

## Security Configuration

### JWT Authentication
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String token = extractTokenFromRequest(request);
        
        if (token != null && jwtUtil.validateToken(token)) {
            String username = jwtUtil.getUsernameFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);
            
            // Set authentication context
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(username, null, 
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)));
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        
        filterChain.doFilter(request, response);
    }
}
```

### Access Control
- **Public Endpoints**: Doctor listing and search
- **Doctor Access**: Profile management and patient data access
- **Role Verification**: Ensures only doctors can access doctor-specific endpoints

## Configuration Files

### application.properties
```properties
# Service Configuration
spring.application.name=doctor-service
server.port=8083

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
patient.service.url=http://localhost:8082/api/patients
appointment.service.url=http://localhost:8085/api/appointments

# Eureka Configuration
eureka.client.service-url.defaultZone=http://localhost:8761/eureka
eureka.client.register-with-eureka=true
eureka.client.fetch-registry=true

# CORS Configuration
spring.web.cors.allowed-origins=http://localhost:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
spring.web.cors.max-age=3600

# Logging Configuration
logging.level.org.springframework=INFO
logging.level.com.clinicmanager=DEBUG
logging.file.name=logs/doctor-service.log
```

## Error Handling

### Global Exception Handler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
            "RESOURCE_NOT_FOUND", 
            ex.getMessage(), 
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex) {
        ErrorResponse error = new ErrorResponse(
            "UNAUTHORIZED", 
            ex.getMessage(), 
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
    
    @ExceptionHandler(FeignException.class)
    public ResponseEntity<ErrorResponse> handleFeignException(FeignException ex) {
        ErrorResponse error = new ErrorResponse(
            "SERVICE_COMMUNICATION_ERROR", 
            "Error communicating with external service", 
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error);
    }
}
```

## Data Validation

### Input Validation
```java
@Valid
public class DoctorUpdateRequest {
    @NotBlank(message = "First name is required")
    @Size(max = 255, message = "First name must not exceed 255 characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(max = 255, message = "Last name must not exceed 255 characters")
    private String lastName;
    
    @NotBlank(message = "Specialty is required")
    private String specialty;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Consultation fee must be positive")
    @DecimalMax(value = "9999.99", message = "Consultation fee must not exceed 9999.99")
    private Double consultationFee;
    
    @Min(value = 0, message = "Years of experience cannot be negative")
    @Max(value = 70, message = "Years of experience seems unrealistic")
    private Integer yearsOfExperience;
}
```

## Testing

### Unit Tests
```java
@ExtendWith(MockitoExtension.class)
class DoctorServiceTest {
    
    @Mock
    private DoctorRepository doctorRepository;
    
    @Mock
    private PatientServiceClient patientServiceClient;
    
    @Mock
    private AppointmentServiceClient appointmentServiceClient;
    
    @InjectMocks
    private DoctorService doctorService;
    
    @Test
    void testGetAllDoctors() {
        // Test implementation
        List<Doctor> doctors = Arrays.asList(new Doctor(), new Doctor());
        when(doctorRepository.findAll()).thenReturn(doctors);
        
        List<Doctor> result = doctorService.getAllDoctors();
        
        assertEquals(2, result.size());
        verify(doctorRepository).findAll();
    }
    
    @Test
    void testGetDoctorsBySpecialty() {
        // Test implementation
        String specialty = "Cardiology";
        List<Doctor> doctors = Arrays.asList(new Doctor());
        when(doctorRepository.findBySpecialtyIgnoreCase(specialty)).thenReturn(doctors);
        
        List<Doctor> result = doctorService.getDoctorsBySpecialty(specialty);
        
        assertEquals(1, result.size());
        verify(doctorRepository).findBySpecialtyIgnoreCase(specialty);
    }
}
```

### Integration Tests
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class DoctorControllerIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void testGetAllDoctors() {
        ResponseEntity<Doctor[]> response = restTemplate.getForEntity("/api/doctors", Doctor[].class);
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }
}
```

## Performance Optimization

### Caching Strategy
```java
@Cacheable(value = "doctors", key = "#specialty")
public List<Doctor> getDoctorsBySpecialty(String specialty) {
    return doctorRepository.findBySpecialtyIgnoreCase(specialty);
}

@Cacheable(value = "doctor-profile", key = "#userId")
public Doctor getDoctorProfile(Long userId) {
    return doctorRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
}

@CacheEvict(value = {"doctors", "doctor-profile"}, key = "#userId")
public Doctor updateDoctorProfile(Long userId, Doctor doctorData) {
    // Update implementation
}
```

### Database Optimization
- **Indexes**: Specialty field for fast specialty-based queries
- **Connection Pooling**: Optimized HikariCP settings
- **Query Optimization**: Efficient JPA queries

## Monitoring and Logging

### Custom Metrics
```java
@Component
public class DoctorMetrics {
    
    private final MeterRegistry meterRegistry;
    private final Counter doctorProfileUpdates;
    private final Timer appointmentRetrievalTime;
    
    public DoctorMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.doctorProfileUpdates = Counter.builder("doctor.profile.updates")
            .description("Number of doctor profile updates")
            .register(meterRegistry);
        this.appointmentRetrievalTime = Timer.builder("doctor.appointments.retrieval.time")
            .description("Time taken to retrieve doctor appointments")
            .register(meterRegistry);
    }
    
    public void incrementProfileUpdates() {
        doctorProfileUpdates.increment();
    }
    
    public Timer.Sample startAppointmentRetrievalTimer() {
        return Timer.start(meterRegistry);
    }
}
```

### Health Checks
```java
@Component
public class DoctorServiceHealthIndicator implements HealthIndicator {
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Override
    public Health health() {
        try {
            long doctorCount = doctorRepository.count();
            return Health.up()
                .withDetail("doctorCount", doctorCount)
                .withDetail("status", "Doctor service is healthy")
                .build();
        } catch (Exception e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
```

## API Documentation
- **Swagger UI**: http://localhost:8083/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8083/v3/api-docs

## Troubleshooting

### Common Issues

1. **Service Communication Failures**
   - Check network connectivity between services
   - Verify service URLs in configuration
   - Test Feign client endpoints manually

2. **Doctor Profile Not Found**
   - Ensure doctor record exists in database
   - Verify user ID mapping between User and Doctor services
   - Check JWT token validity and user role

3. **Specialty Search Issues**
   - Verify specialty names are consistent
   - Check case sensitivity in search queries
   - Validate database data integrity

### Debug Commands
```bash
# Check service health
curl http://localhost:8083/actuator/health

# Test doctor listing
curl http://localhost:8083/api/doctors

# Test specialty search
curl http://localhost:8083/api/doctors/specialty/Cardiology

# Test doctor profile (requires token)
curl -H "Authorization: Bearer <token>" \
     http://localhost:8083/api/doctors/me
```

## Future Enhancements

### Planned Features
- **Availability Management**: Real-time availability tracking
- **Rating System**: Patient rating and review system
- **Telemedicine Integration**: Video consultation capabilities
- **Schedule Management**: Advanced scheduling and calendar integration
- **Notification System**: Appointment reminders and updates

### Technical Improvements
- **Event-Driven Architecture**: Implement event sourcing for doctor updates
- **Advanced Caching**: Redis-based distributed caching
- **Circuit Breaker**: Resilience patterns for service communication
- **Audit Trail**: Complete audit logging for doctor activities

---

**Service Version**: 1.0.0
**Last Updated**: January 2025
**Maintainer**: Development Team