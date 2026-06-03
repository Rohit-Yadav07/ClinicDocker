# Appointment Service Documentation

## Overview
The Appointment Service manages appointment scheduling, booking, and status tracking in the Clinic Management System. It serves as the central coordination point between patients and doctors for appointment management.

## Service Configuration
- **Port**: 8085
- **Database**: MySQL (clinic_manager)
- **Service Discovery**: Eureka Client
- **Security**: JWT-based authentication
- **Inter-service Communication**: OpenFeign

## Architecture

### Package Structure
```
com.appointment_service/
├── config/                        # Configuration classes
│   ├── CorsConfig.java           # CORS configuration
│   ├── FeignConfig.java          # Feign client configuration
│   ├── JwtAuthenticationFilter.java # JWT authentication filter
│   ├── SecurityConfig.java       # Spring Security setup
│   └── SwaggerSecurityConfig.java # Swagger security
├── controller/                   # REST controllers
│   └── AppointmentController.java # Appointment management endpoints
├── entity/                       # JPA entities
│   └── Appointment.java          # Appointment entity
├── exception/                    # Exception handling
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   └── UnauthorizedException.java
├── feign/                        # Feign clients
│   ├── DoctorServiceClient.java  # Doctor service integration
│   └── UserServiceClient.java    # User service integration
├── repository/                   # Data access layer
│   └── AppointmentRepository.java
├── service/                      # Business logic
│   └── AppointmentService.java
├── util/                         # Utility classes
│   └── JwtUtil.java              # JWT token utilities
└── AppointmentServiceApplication.java # Main application class
```

## Entities

### Appointment Entity
```java
@Entity
@Table(name = "appointments")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long patientId;  // References User.id from User Service
    
    @Column(nullable = false)
    private Long doctorId;   // References User.id from User Service
    
    @Column(nullable = false)
    private LocalDateTime appointmentTime;
    
    private String status;   // SCHEDULED, COMPLETED, CANCELLED, RESCHEDULED
    
    private String notes;
}
```

### Appointment Status Enumeration
```java
public enum AppointmentStatus {
    SCHEDULED("SCHEDULED"),
    CONFIRMED("CONFIRMED"),
    IN_PROGRESS("IN_PROGRESS"),
    COMPLETED("COMPLETED"),
    CANCELLED("CANCELLED"),
    RESCHEDULED("RESCHEDULED"),
    NO_SHOW("NO_SHOW");
    
    private final String value;
    
    AppointmentStatus(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}
```

## API Endpoints

### Appointment Controller (`/api/appointments`)

#### POST /api/appointments
**Description**: Book a new appointment
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
    "doctorId": 1,
    "appointmentTime": "2025-01-25T10:00:00",
    "notes": "Regular checkup appointment"
}
```
**Response**:
```json
{
    "id": 1,
    "patientId": 2,
    "doctorId": 1,
    "appointmentTime": "2025-01-25T10:00:00",
    "status": "SCHEDULED",
    "notes": "Regular checkup appointment"
}
```

#### GET /api/appointments/me
**Description**: Get current user's appointments
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `status` (optional): Filter by appointment status
- `from` (optional): Start date filter (ISO format)
- `to` (optional): End date filter (ISO format)
**Response**:
```json
[
    {
        "id": 1,
        "patientId": 2,
        "doctorId": 1,
        "appointmentTime": "2025-01-25T10:00:00",
        "status": "SCHEDULED",
        "notes": "Regular checkup appointment",
        "doctorName": "Dr. John Smith",
        "patientName": "Jane Doe"
    }
]
```

#### GET /api/appointments/{id}
**Description**: Get appointment by ID
**Headers**: `Authorization: Bearer <token>`
**Access**: Patient or Doctor involved in the appointment
**Response**: Appointment object with additional details

#### PUT /api/appointments/{id}
**Description**: Update appointment details
**Headers**: `Authorization: Bearer <token>`
**Access**: Patient or Doctor involved in the appointment
**Request Body**:
```json
{
    "appointmentTime": "2025-01-25T14:00:00",
    "notes": "Rescheduled appointment"
}
```

#### PUT /api/appointments/{id}/status
**Description**: Update appointment status
**Headers**: `Authorization: Bearer <token>`
**Parameters**:
- `status` (String): New appointment status
**Access**: Doctor can update to any status, Patient can only cancel
**Response**: Updated appointment object

#### DELETE /api/appointments/{id}
**Description**: Cancel appointment
**Headers**: `Authorization: Bearer <token>`
**Access**: Patient or Doctor involved in the appointment
**Response**: Success message

#### GET /api/appointments/doctor/{doctorId}
**Description**: Get appointments for a specific doctor
**Headers**: `Authorization: Bearer <token>`
**Access**: Doctor role required
**Query Parameters**:
- `date` (optional): Specific date filter
- `status` (optional): Status filter
**Response**: Array of appointments

#### GET /api/appointments/patient/{patientId}
**Description**: Get appointments for a specific patient
**Headers**: `Authorization: Bearer <token>`
**Access**: Doctor role or the patient themselves
**Response**: Array of appointments

#### GET /api/appointments/available-slots
**Description**: Get available appointment slots for a doctor
**Parameters**:
- `doctorId` (Long): Doctor ID
- `date` (String): Date in YYYY-MM-DD format
**Response**:
```json
{
    "date": "2025-01-25",
    "doctorId": 1,
    "availableSlots": [
        "09:00:00",
        "09:30:00",
        "10:00:00",
        "10:30:00",
        "14:00:00",
        "14:30:00",
        "15:00:00"
    ]
}
```

## Database Schema

### Appointments Table
```sql
CREATE TABLE appointments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_time TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_appointment_time (appointment_time),
    INDEX idx_status (status)
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

### Doctor Service Integration
```java
@FeignClient(name = "doctor-service", url = "${doctor.service.url}")
public interface DoctorServiceClient {
    
    @GetMapping("/{doctorId}")
    DoctorDTO getDoctorById(@PathVariable Long doctorId);
    
    @GetMapping("/{doctorId}/availability")
    AvailabilityDTO getDoctorAvailability(@PathVariable Long doctorId, 
                                         @RequestParam String date);
}
```

## Business Logic

### Appointment Service Implementation
```java
@Service
@Transactional
public class AppointmentService {
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private UserServiceClient userServiceClient;
    
    @Autowired
    private DoctorServiceClient doctorServiceClient;
    
    public Appointment bookAppointment(Long patientId, AppointmentRequest request) {
        // Validate doctor exists
        DoctorDTO doctor = doctorServiceClient.getDoctorById(request.getDoctorId());
        
        // Check availability
        if (!isSlotAvailable(request.getDoctorId(), request.getAppointmentTime())) {
            throw new AppointmentConflictException("Time slot not available");
        }
        
        // Create appointment
        Appointment appointment = new Appointment();
        appointment.setPatientId(patientId);
        appointment.setDoctorId(request.getDoctorId());
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setStatus(AppointmentStatus.SCHEDULED.getValue());
        appointment.setNotes(request.getNotes());
        
        return appointmentRepository.save(appointment);
    }
    
    public List<Appointment> getUserAppointments(Long userId, String role) {
        if ("DOCTOR".equals(role)) {
            return appointmentRepository.findByDoctorIdOrderByAppointmentTimeAsc(userId);
        } else {
            return appointmentRepository.findByPatientIdOrderByAppointmentTimeAsc(userId);
        }
    }
    
    public Appointment updateAppointmentStatus(Long appointmentId, String status, Long userId, String role) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        
        // Validate access
        validateAppointmentAccess(appointment, userId, role);
        
        // Validate status transition
        validateStatusTransition(appointment.getStatus(), status, role);
        
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }
    
    private boolean isSlotAvailable(Long doctorId, LocalDateTime appointmentTime) {
        List<Appointment> conflictingAppointments = appointmentRepository
            .findByDoctorIdAndAppointmentTimeBetween(
                doctorId,
                appointmentTime.minusMinutes(29),
                appointmentTime.plusMinutes(29)
            );
        
        return conflictingAppointments.stream()
            .noneMatch(apt -> !apt.getStatus().equals(AppointmentStatus.CANCELLED.getValue()));
    }
    
    private void validateAppointmentAccess(Appointment appointment, Long userId, String role) {
        if ("DOCTOR".equals(role)) {
            if (!appointment.getDoctorId().equals(userId)) {
                throw new UnauthorizedException("Access denied to this appointment");
            }
        } else {
            if (!appointment.getPatientId().equals(userId)) {
                throw new UnauthorizedException("Access denied to this appointment");
            }
        }
    }
    
    private void validateStatusTransition(String currentStatus, String newStatus, String role) {
        // Define allowed status transitions based on role
        Map<String, Set<String>> allowedTransitions = new HashMap<>();
        
        if ("DOCTOR".equals(role)) {
            allowedTransitions.put("SCHEDULED", Set.of("CONFIRMED", "CANCELLED", "RESCHEDULED"));
            allowedTransitions.put("CONFIRMED", Set.of("IN_PROGRESS", "CANCELLED", "NO_SHOW"));
            allowedTransitions.put("IN_PROGRESS", Set.of("COMPLETED", "CANCELLED"));
        } else {
            allowedTransitions.put("SCHEDULED", Set.of("CANCELLED"));
            allowedTransitions.put("CONFIRMED", Set.of("CANCELLED"));
        }
        
        Set<String> allowed = allowedTransitions.get(currentStatus);
        if (allowed == null || !allowed.contains(newStatus)) {
            throw new InvalidStatusTransitionException(
                String.format("Cannot transition from %s to %s", currentStatus, newStatus)
            );
        }
    }
}
```

## Security Configuration

### JWT Authentication and Authorization
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/appointments/available-slots").permitAll()
                .requestMatchers(HttpMethod.GET, "/actuator/health").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

### Access Control Rules
- **Public Access**: Available slots endpoint
- **Authenticated Access**: All appointment operations
- **Role-based Access**: 
  - Doctors can view all their appointments and update statuses
  - Patients can only view/modify their own appointments
  - Status update permissions vary by role

## Configuration Files

### application.properties
```properties
# Service Configuration
spring.application.name=appointment-service
server.port=8085

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
doctor.service.url=http://localhost:8083/api/doctors

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
logging.file.name=logs/appointment-service.log

# Appointment Configuration
appointment.slot.duration=30  # minutes
appointment.advance.booking.days=90
appointment.cancellation.hours=24
```

## Error Handling

### Custom Exceptions
```java
@ResponseStatus(HttpStatus.CONFLICT)
public class AppointmentConflictException extends RuntimeException {
    public AppointmentConflictException(String message) {
        super(message);
    }
}

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidStatusTransitionException extends RuntimeException {
    public InvalidStatusTransitionException(String message) {
        super(message);
    }
}

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidAppointmentTimeException extends RuntimeException {
    public InvalidAppointmentTimeException(String message) {
        super(message);
    }
}
```

### Global Exception Handler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(AppointmentConflictException.class)
    public ResponseEntity<ErrorResponse> handleAppointmentConflict(AppointmentConflictException ex) {
        ErrorResponse error = new ErrorResponse(
            "APPOINTMENT_CONFLICT",
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }
    
    @ExceptionHandler(InvalidStatusTransitionException.class)
    public ResponseEntity<ErrorResponse> handleInvalidStatusTransition(InvalidStatusTransitionException ex) {
        ErrorResponse error = new ErrorResponse(
            "INVALID_STATUS_TRANSITION",
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler(InvalidAppointmentTimeException.class)
    public ResponseEntity<ErrorResponse> handleInvalidAppointmentTime(InvalidAppointmentTimeException ex) {
        ErrorResponse error = new ErrorResponse(
            "INVALID_APPOINTMENT_TIME",
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
```

## Data Validation

### Appointment Request Validation
```java
@Valid
public class AppointmentRequest {
    @NotNull(message = "Doctor ID is required")
    private Long doctorId;
    
    @NotNull(message = "Appointment time is required")
    @Future(message = "Appointment time must be in the future")
    private LocalDateTime appointmentTime;
    
    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;
    
    @AssertTrue(message = "Appointment must be during business hours")
    public boolean isValidBusinessHours() {
        if (appointmentTime == null) return true;
        
        int hour = appointmentTime.getHour();
        DayOfWeek dayOfWeek = appointmentTime.getDayOfWeek();
        
        // Business hours: Monday-Friday 8AM-6PM, Saturday 9AM-1PM
        if (dayOfWeek == DayOfWeek.SUNDAY) return false;
        if (dayOfWeek == DayOfWeek.SATURDAY) return hour >= 9 && hour < 13;
        return hour >= 8 && hour < 18;
    }
}
```

## Testing

### Unit Tests
```java
@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {
    
    @Mock
    private AppointmentRepository appointmentRepository;
    
    @Mock
    private UserServiceClient userServiceClient;
    
    @Mock
    private DoctorServiceClient doctorServiceClient;
    
    @InjectMocks
    private AppointmentService appointmentService;
    
    @Test
    void testBookAppointment_Success() {
        // Given
        Long patientId = 1L;
        AppointmentRequest request = new AppointmentRequest();
        request.setDoctorId(2L);
        request.setAppointmentTime(LocalDateTime.now().plusDays(1));
        
        DoctorDTO doctor = new DoctorDTO();
        doctor.setUserId(2L);
        
        when(doctorServiceClient.getDoctorById(2L)).thenReturn(doctor);
        when(appointmentRepository.findByDoctorIdAndAppointmentTimeBetween(any(), any(), any()))
            .thenReturn(Collections.emptyList());
        when(appointmentRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        
        // When
        Appointment result = appointmentService.bookAppointment(patientId, request);
        
        // Then
        assertNotNull(result);
        assertEquals(patientId, result.getPatientId());
        assertEquals(request.getDoctorId(), result.getDoctorId());
        assertEquals("SCHEDULED", result.getStatus());
    }
    
    @Test
    void testBookAppointment_ConflictingTime() {
        // Given
        Long patientId = 1L;
        AppointmentRequest request = new AppointmentRequest();
        request.setDoctorId(2L);
        request.setAppointmentTime(LocalDateTime.now().plusDays(1));
        
        DoctorDTO doctor = new DoctorDTO();
        when(doctorServiceClient.getDoctorById(2L)).thenReturn(doctor);
        
        Appointment existingAppointment = new Appointment();
        existingAppointment.setStatus("SCHEDULED");
        when(appointmentRepository.findByDoctorIdAndAppointmentTimeBetween(any(), any(), any()))
            .thenReturn(Arrays.asList(existingAppointment));
        
        // When & Then
        assertThrows(AppointmentConflictException.class, 
            () -> appointmentService.bookAppointment(patientId, request));
    }
}
```

### Integration Tests
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class AppointmentControllerIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Test
    void testBookAppointment() {
        // Setup test data
        AppointmentRequest request = new AppointmentRequest();
        request.setDoctorId(1L);
        request.setAppointmentTime(LocalDateTime.now().plusDays(1));
        request.setNotes("Test appointment");
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth("valid_jwt_token");
        HttpEntity<AppointmentRequest> entity = new HttpEntity<>(request, headers);
        
        // Execute request
        ResponseEntity<Appointment> response = restTemplate.postForEntity(
            "/api/appointments", entity, Appointment.class);
        
        // Verify response
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("SCHEDULED", response.getBody().getStatus());
    }
}
```

## Performance Optimization

### Database Optimization
```java
// Repository with optimized queries
@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    @Query("SELECT a FROM Appointment a WHERE a.doctorId = :doctorId " +
           "AND a.appointmentTime BETWEEN :startTime AND :endTime " +
           "AND a.status NOT IN ('CANCELLED')")
    List<Appointment> findActiveAppointmentsByDoctorAndTimeRange(
        @Param("doctorId") Long doctorId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    @Query("SELECT a FROM Appointment a WHERE a.patientId = :patientId " +
           "ORDER BY a.appointmentTime DESC")
    List<Appointment> findByPatientIdOrderByAppointmentTimeDesc(@Param("patientId") Long patientId);
    
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctorId = :doctorId " +
           "AND DATE(a.appointmentTime) = DATE(:date) " +
           "AND a.status NOT IN ('CANCELLED')")
    long countActiveAppointmentsByDoctorAndDate(
        @Param("doctorId") Long doctorId,
        @Param("date") LocalDateTime date
    );
}
```

### Caching Strategy
```java
@Cacheable(value = "available-slots", key = "#doctorId + '_' + #date")
public List<String> getAvailableSlots(Long doctorId, LocalDate date) {
    // Implementation to calculate available slots
    List<String> allSlots = generateTimeSlots();
    List<Appointment> bookedAppointments = getBookedAppointments(doctorId, date);
    
    return allSlots.stream()
        .filter(slot -> !isSlotBooked(slot, bookedAppointments))
        .collect(Collectors.toList());
}

@CacheEvict(value = "available-slots", key = "#appointment.doctorId + '_' + #appointment.appointmentTime.toLocalDate()")
public Appointment saveAppointment(Appointment appointment) {
    return appointmentRepository.save(appointment);
}
```

## Monitoring and Logging

### Custom Metrics
```java
@Component
public class AppointmentMetrics {
    
    private final MeterRegistry meterRegistry;
    private final Counter appointmentBookings;
    private final Counter appointmentCancellations;
    private final Gauge activeAppointments;
    
    public AppointmentMetrics(MeterRegistry meterRegistry, AppointmentRepository repository) {
        this.meterRegistry = meterRegistry;
        this.appointmentBookings = Counter.builder("appointments.bookings")
            .description("Number of appointment bookings")
            .register(meterRegistry);
        this.appointmentCancellations = Counter.builder("appointments.cancellations")
            .description("Number of appointment cancellations")
            .register(meterRegistry);
        this.activeAppointments = Gauge.builder("appointments.active")
            .description("Number of active appointments")
            .register(meterRegistry, this, AppointmentMetrics::getActiveAppointmentCount);
    }
    
    public void incrementBookings() {
        appointmentBookings.increment();
    }
    
    public void incrementCancellations() {
        appointmentCancellations.increment();
    }
    
    private double getActiveAppointmentCount() {
        // Implementation to count active appointments
        return 0.0; // Placeholder
    }
}
```

### Health Checks
```java
@Component
public class AppointmentServiceHealthIndicator implements HealthIndicator {
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private UserServiceClient userServiceClient;
    
    @Override
    public Health health() {
        try {
            // Check database connectivity
            long appointmentCount = appointmentRepository.count();
            
            // Check external service connectivity
            // userServiceClient.getCurrentUser("test-token");
            
            return Health.up()
                .withDetail("appointmentCount", appointmentCount)
                .withDetail("database", "Connected")
                .withDetail("externalServices", "Available")
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
- **Swagger UI**: http://localhost:8085/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8085/v3/api-docs

## Troubleshooting

### Common Issues

1. **Appointment Booking Conflicts**
   - Check time slot availability logic
   - Verify appointment duration configuration
   - Review concurrent booking handling

2. **Status Transition Errors**
   - Validate status transition rules
   - Check user role permissions
   - Verify appointment ownership

3. **Service Communication Issues**
   - Test User Service connectivity
   - Verify Doctor Service integration
   - Check Feign client configuration

### Debug Commands
```bash
# Check service health
curl http://localhost:8085/actuator/health

# Test available slots
curl "http://localhost:8085/api/appointments/available-slots?doctorId=1&date=2025-01-25"

# Test appointment booking (requires token)
curl -X POST -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"doctorId":1,"appointmentTime":"2025-01-25T10:00:00","notes":"Test"}' \
     http://localhost:8085/api/appointments

# Get user appointments (requires token)
curl -H "Authorization: Bearer <token>" \
     http://localhost:8085/api/appointments/me
```

## Future Enhancements

### Planned Features
- **Recurring Appointments**: Support for recurring appointment patterns
- **Appointment Reminders**: Email/SMS notification system
- **Waitlist Management**: Automatic booking from waitlist
- **Video Consultation**: Integration with telemedicine platforms
- **Payment Integration**: Online payment for appointments

### Technical Improvements
- **Event-Driven Architecture**: Appointment events for notifications
- **Advanced Scheduling**: AI-powered optimal scheduling
- **Real-time Updates**: WebSocket for real-time appointment updates
- **Bulk Operations**: Batch appointment management
- **Analytics**: Appointment analytics and reporting

---

**Service Version**: 1.0.0
**Last Updated**: January 2025
**Maintainer**: Development Team