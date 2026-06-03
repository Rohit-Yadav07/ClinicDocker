# API Gateway Documentation

## Overview
The API Gateway serves as the single entry point for all client requests in the Clinic Management System. It provides centralized routing, load balancing, security, and API documentation aggregation for all microservices.

## Service Configuration
- **Port**: 8080
- **Framework**: Spring Cloud Gateway
- **Service Discovery**: Eureka Client
- **Documentation**: SpringDoc OpenAPI aggregation

## Architecture

### Package Structure
```
com.api_gateway/
├── config/                    # Configuration classes
│   └── OpenApiConfig.java    # OpenAPI documentation configuration
└── ApiGatewayApplication.java # Main application class
```

## Core Functionality

### Request Routing
The API Gateway routes incoming requests to appropriate microservices based on path patterns:

```
Client Request → API Gateway → Target Microservice
     ↓              ↓              ↓
/api/users/*   →   Gateway   →  User Service (8081)
/api/patients/* →   Gateway   →  Patient Service (8082)
/api/doctors/*  →   Gateway   →  Doctor Service (8083)
/api/appointments/* → Gateway → Appointment Service (8085)
```

### Service Discovery Integration
- **Eureka Integration**: Automatically discovers available service instances
- **Load Balancing**: Distributes requests across multiple service instances
- **Health Monitoring**: Routes traffic only to healthy service instances

## Configuration

### application.properties
```properties
# Service Configuration
spring.application.name=api-gateway
server.port=8080

# Eureka Client Configuration
eureka.client.service-url.default-zone=http://localhost:8761/eureka
eureka.client.register-with-eureka=true
eureka.client.fetch-registry=true

# Gateway Configuration
spring.cloud.gateway.discovery.locator.enabled=true
spring.cloud.gateway.discovery.locator.lower-case-service-id=true

# Route Definitions
spring.cloud.gateway.routes[0].id=user-service
spring.cloud.gateway.routes[0].uri=lb://user-service
spring.cloud.gateway.routes[0].predicates[0]=Path=/api/users/**,/api/auth/**

spring.cloud.gateway.routes[1].id=patient-service
spring.cloud.gateway.routes[1].uri=lb://patient-service
spring.cloud.gateway.routes[1].predicates[0]=Path=/api/patients/**

spring.cloud.gateway.routes[2].id=doctor-service
spring.cloud.gateway.routes[2].uri=lb://doctor-service
spring.cloud.gateway.routes[2].predicates[0]=Path=/api/doctors/**

spring.cloud.gateway.routes[3].id=appointment-service
spring.cloud.gateway.routes[3].uri=lb://appointment-service
spring.cloud.gateway.routes[3].predicates[0]=Path=/api/appointments/**

# Swagger UI Aggregation
springdoc.swagger-ui.urls[0].name=user-service
springdoc.swagger-ui.urls[0].url=/user-service/v3/api-docs
springdoc.swagger-ui.urls[1].name=patient-service
springdoc.swagger-ui.urls[1].url=/patient-service/v3/api-docs
springdoc.swagger-ui.urls[2].name=doctor-service
springdoc.swagger-ui.urls[2].url=/doctor-service/v3/api-docs
springdoc.swagger-ui.urls[3].name=appointment-service
springdoc.swagger-ui.urls[3].url=/appointment-service/v3/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
```

## Routing Configuration

### Route Definitions

#### User Service Routes
```yaml
Route ID: user-service
URI: lb://user-service
Predicates:
  - Path=/api/users/**
  - Path=/api/auth/**
Description: Routes authentication and user management requests
```

#### Patient Service Routes
```yaml
Route ID: patient-service
URI: lb://patient-service
Predicates:
  - Path=/api/patients/**
Description: Routes patient profile and medical history requests
```

#### Doctor Service Routes
```yaml
Route ID: doctor-service
URI: lb://doctor-service
Predicates:
  - Path=/api/doctors/**
Description: Routes doctor profile and specialty requests
```

#### Appointment Service Routes
```yaml
Route ID: appointment-service
URI: lb://appointment-service
Predicates:
  - Path=/api/appointments/**
Description: Routes appointment booking and management requests
```

### Load Balancing Strategy
- **Algorithm**: Round Robin (default)
- **Service Discovery**: Eureka-based service instance discovery
- **Health Checks**: Automatic exclusion of unhealthy instances
- **Failover**: Automatic retry on different instances

## OpenAPI Documentation Configuration

### OpenApiConfig.java
```java
@Configuration
public class OpenApiConfig {
    
    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("clinic-management-system")
                .displayName("Clinic Management System API")
                .pathsToMatch("/api/**")
                .build();
    }
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Clinic Management System API Gateway")
                        .version("1.0.0")
                        .description("Centralized API documentation for all microservices")
                        .contact(new Contact()
                                .name("Development Team")
                                .email("dev@clinic.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(Arrays.asList(
                        new Server().url("http://localhost:8080").description("Development Server"),
                        new Server().url("https://api.clinic.com").description("Production Server")
                ));
    }
}
```

### Aggregated Documentation Access
- **Main Swagger UI**: http://localhost:8080/swagger-ui.html
- **Individual Service Docs**:
  - User Service: http://localhost:8080/user-service/v3/api-docs
  - Patient Service: http://localhost:8080/patient-service/v3/api-docs
  - Doctor Service: http://localhost:8080/doctor-service/v3/api-docs
  - Appointment Service: http://localhost:8080/appointment-service/v3/api-docs

## Request Flow

### Typical Request Flow
```
1. Client sends request to API Gateway (http://localhost:8080/api/users/me)
2. Gateway receives request and matches route pattern (/api/users/**)
3. Gateway queries Eureka for available user-service instances
4. Gateway selects healthy instance using load balancing
5. Gateway forwards request to selected instance (http://user-service-instance/api/users/me)
6. Target service processes request and returns response
7. Gateway forwards response back to client
```

### Request Headers
The gateway preserves and forwards important headers:
- **Authorization**: JWT tokens for authentication
- **Content-Type**: Request/response content types
- **User-Agent**: Client identification
- **X-Forwarded-For**: Original client IP
- **X-Forwarded-Proto**: Original protocol (HTTP/HTTPS)

## Security Features

### CORS Configuration
```java
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOriginPatterns(Arrays.asList("*"));
        corsConfig.setMaxAge(3600L);
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        corsConfig.setAllowedHeaders(Arrays.asList("*"));
        corsConfig.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        
        return new CorsWebFilter(source);
    }
}
```

### Rate Limiting (Future Enhancement)
```yaml
# Example rate limiting configuration
spring.cloud.gateway.routes[0].filters[0]=RequestRateLimiter=10,1s
```

### Request/Response Logging
```java
@Component
public class LoggingFilter implements GlobalFilter, Ordered {
    
    private static final Logger logger = LoggerFactory.getLogger(LoggingFilter.class);
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        logger.info("Request: {} {} from {}", 
            request.getMethod(), 
            request.getURI(), 
            request.getRemoteAddress());
        
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            ServerHttpResponse response = exchange.getResponse();
            logger.info("Response: {} for {} {}", 
                response.getStatusCode(), 
                request.getMethod(), 
                request.getURI());
        }));
    }
    
    @Override
    public int getOrder() {
        return -1; // Execute before other filters
    }
}
```

## Error Handling

### Global Error Handler
```java
@Component
public class GlobalErrorWebExceptionHandler extends AbstractErrorWebExceptionHandler {
    
    public GlobalErrorWebExceptionHandler(ErrorAttributes errorAttributes,
                                        ApplicationContext applicationContext,
                                        ServerCodecConfigurer serverCodecConfigurer) {
        super(errorAttributes, new WebProperties.Resources(), applicationContext);
        super.setMessageWriters(serverCodecConfigurer.getWriters());
        super.setMessageReaders(serverCodecConfigurer.getReaders());
    }
    
    @Override
    protected RouterFunction<ServerResponse> getRoutingFunction(ErrorAttributes errorAttributes) {
        return RouterFunctions.route(RequestPredicates.all(), this::renderErrorResponse);
    }
    
    private Mono<ServerResponse> renderErrorResponse(ServerRequest request) {
        Map<String, Object> errorPropertiesMap = getErrorAttributes(request, ErrorAttributeOptions.defaults());
        
        return ServerResponse.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(errorPropertiesMap));
    }
}
```

### Circuit Breaker Integration
```java
@Configuration
public class CircuitBreakerConfig {
    
    @Bean
    public ReactiveResilience4JCircuitBreakerFactory reactiveResilience4JCircuitBreakerFactory() {
        CircuitBreakerConfig circuitBreakerConfig = CircuitBreakerConfig.custom()
                .failureRateThreshold(50)
                .waitDurationInOpenState(Duration.ofMillis(1000))
                .slidingWindowSize(2)
                .build();
        
        ReactiveResilience4JCircuitBreakerFactory factory = new ReactiveResilience4JCircuitBreakerFactory();
        factory.configureDefault(id -> new Resilience4JConfigBuilder(id)
                .circuitBreakerConfig(circuitBreakerConfig)
                .build());
        
        return factory;
    }
}
```

## Monitoring and Observability

### Actuator Endpoints
```properties
# Actuator configuration
management.endpoints.web.exposure.include=health,info,metrics,gateway
management.endpoint.health.show-details=always
management.endpoint.gateway.enabled=true
```

### Available Actuator Endpoints
- **Health Check**: http://localhost:8080/actuator/health
- **Gateway Routes**: http://localhost:8080/actuator/gateway/routes
- **Gateway Filters**: http://localhost:8080/actuator/gateway/globalfilters
- **Metrics**: http://localhost:8080/actuator/metrics

### Custom Health Indicators
```java
@Component
public class GatewayHealthIndicator implements ReactiveHealthIndicator {
    
    @Autowired
    private EurekaClient eurekaClient;
    
    @Override
    public Mono<Health> health() {
        return Mono.fromCallable(() -> {
            try {
                // Check Eureka connectivity
                Applications applications = eurekaClient.getApplications();
                int serviceCount = applications.getRegisteredApplications().size();
                
                return Health.up()
                        .withDetail("registeredServices", serviceCount)
                        .withDetail("eurekaStatus", "UP")
                        .build();
            } catch (Exception e) {
                return Health.down()
                        .withDetail("error", e.getMessage())
                        .build();
            }
        });
    }
}
```

## Performance Optimization

### Connection Pooling
```properties
# HTTP client configuration
spring.cloud.gateway.httpclient.pool.type=elastic
spring.cloud.gateway.httpclient.pool.max-connections=100
spring.cloud.gateway.httpclient.pool.max-idle-time=30s
spring.cloud.gateway.httpclient.pool.max-life-time=60s
```

### Caching Configuration
```java
@Configuration
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(1000)
                .expireAfterWrite(Duration.ofMinutes(10)));
        return cacheManager;
    }
}
```

### Request Timeout Configuration
```properties
# Timeout configuration
spring.cloud.gateway.httpclient.connect-timeout=5000
spring.cloud.gateway.httpclient.response-timeout=30s
```

## Custom Filters

### Authentication Filter
```java
@Component
public class AuthenticationFilter implements GatewayFilter, Ordered {
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        // Skip authentication for public endpoints
        if (isPublicEndpoint(request.getPath().toString())) {
            return chain.filter(exchange);
        }
        
        String token = extractToken(request);
        if (token == null || !jwtUtil.validateToken(token)) {
            return handleUnauthorized(exchange);
        }
        
        // Add user info to headers
        String username = jwtUtil.getUsernameFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);
        
        ServerHttpRequest modifiedRequest = request.mutate()
                .header("X-User-Name", username)
                .header("X-User-Role", role)
                .build();
        
        return chain.filter(exchange.mutate().request(modifiedRequest).build());
    }
    
    private boolean isPublicEndpoint(String path) {
        return path.startsWith("/api/auth/") || 
               path.startsWith("/swagger-ui") || 
               path.startsWith("/v3/api-docs") ||
               path.equals("/actuator/health");
    }
    
    private String extractToken(ServerHttpRequest request) {
        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
    
    private Mono<Void> handleUnauthorized(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        return response.setComplete();
    }
    
    @Override
    public int getOrder() {
        return -100; // Execute early in the filter chain
    }
}
```

### Request/Response Modification Filter
```java
@Component
public class RequestResponseModificationFilter implements GlobalFilter, Ordered {
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        // Add correlation ID for request tracing
        String correlationId = UUID.randomUUID().toString();
        ServerHttpRequest modifiedRequest = request.mutate()
                .header("X-Correlation-ID", correlationId)
                .build();
        
        // Modify response headers
        ServerHttpResponse response = exchange.getResponse();
        response.getHeaders().add("X-Correlation-ID", correlationId);
        response.getHeaders().add("X-Gateway-Version", "1.0.0");
        
        return chain.filter(exchange.mutate().request(modifiedRequest).build());
    }
    
    @Override
    public int getOrder() {
        return 0;
    }
}
```

## Testing

### Integration Tests
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ApiGatewayIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @LocalServerPort
    private int port;
    
    @Test
    void testUserServiceRouting() {
        String url = "http://localhost:" + port + "/api/users/health";
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
    
    @Test
    void testSwaggerUIAccess() {
        String url = "http://localhost:" + port + "/swagger-ui.html";
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
}
```

### Load Testing
```java
@Test
void testGatewayPerformance() {
    int numberOfRequests = 1000;
    int concurrentThreads = 10;
    
    ExecutorService executor = Executors.newFixedThreadPool(concurrentThreads);
    CountDownLatch latch = new CountDownLatch(numberOfRequests);
    
    long startTime = System.currentTimeMillis();
    
    for (int i = 0; i < numberOfRequests; i++) {
        executor.submit(() -> {
            try {
                ResponseEntity<String> response = restTemplate.getForEntity(
                    "http://localhost:" + port + "/api/users/health", String.class);
                assertEquals(HttpStatus.OK, response.getStatusCode());
            } finally {
                latch.countDown();
            }
        });
    }
    
    latch.await();
    long endTime = System.currentTimeMillis();
    
    long totalTime = endTime - startTime;
    double requestsPerSecond = (numberOfRequests * 1000.0) / totalTime;
    
    System.out.println("Requests per second: " + requestsPerSecond);
    assertTrue(requestsPerSecond > 100); // Assert minimum performance
}
```

## Deployment

### Docker Configuration
```dockerfile
FROM openjdk:17-jre-slim
VOLUME /tmp
COPY target/api-gateway-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: clinic/api-gateway:1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE
          value: "http://eureka-server:8761/eureka"
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway-service
spec:
  selector:
    app: api-gateway
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
```

## Troubleshooting

### Common Issues

1. **Service Discovery Issues**
   - Check Eureka server connectivity
   - Verify service registration in Eureka dashboard
   - Ensure correct service names in route configuration

2. **Route Not Found (404 Errors)**
   - Verify route predicates match request paths
   - Check service availability in Eureka
   - Validate load balancer URI format (lb://service-name)

3. **Timeout Issues**
   - Adjust timeout configurations
   - Check target service response times
   - Monitor connection pool usage

4. **CORS Issues**
   - Verify CORS configuration
   - Check allowed origins and methods
   - Ensure preflight requests are handled

### Debug Commands
```bash
# Check gateway health
curl http://localhost:8080/actuator/health

# View configured routes
curl http://localhost:8080/actuator/gateway/routes

# Test specific route
curl http://localhost:8080/api/users/health

# Check Eureka registration
curl http://localhost:8761/eureka/apps/API-GATEWAY
```

### Logging Configuration
```properties
# Logging levels
logging.level.org.springframework.cloud.gateway=DEBUG
logging.level.org.springframework.web.reactive=DEBUG
logging.level.reactor.netty=DEBUG

# Log patterns
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level [%X{correlationId}] %logger{36} - %msg%n
```

## Future Enhancements

### Planned Features
- **API Versioning**: Support for multiple API versions
- **Request/Response Transformation**: Advanced payload modification
- **Caching Layer**: Response caching for improved performance
- **API Analytics**: Request metrics and usage analytics
- **Security Enhancements**: OAuth2, API key management

### Technical Improvements
- **Distributed Tracing**: Zipkin/Jaeger integration
- **Advanced Load Balancing**: Weighted routing, sticky sessions
- **API Gateway Clustering**: High availability setup
- **Real-time Monitoring**: Grafana dashboards and alerting

---

**API Gateway Version**: 1.0.0
**Last Updated**: January 2025
**Maintainer**: Development Team