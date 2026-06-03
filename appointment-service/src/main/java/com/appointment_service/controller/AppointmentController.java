package com.appointment_service.controller;

import com.appointment_service.entity.Appointment;
import com.appointment_service.service.AppointmentService;
import com.appointment_service.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    private static final Logger logger = LoggerFactory.getLogger(AppointmentController.class);
    private final AppointmentService appointmentService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private HttpServletRequest request;

    @PostMapping
    @PreAuthorize("hasAuthority('PATIENT')")
    @Operation(summary = "Book an appointment", description = "Books a new appointment for the authenticated patient")
    public ResponseEntity<Appointment> bookAppointment(@RequestBody Appointment appointment) {
        Long userId = getCurrentUserId();
        String role = getCurrentUserRole();
        System.out.println("User ID: " + userId);
        logger.info("Received request to book appointment for user ID: {}", userId);
        appointment.setPatientId(userId);
        Appointment savedAppointment = appointmentService.bookAppointment(appointment, role);
        return new ResponseEntity<>(savedAppointment, HttpStatus.CREATED);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyAuthority('PATIENT', 'DOCTOR')")
    @Operation(summary = "Get my appointments", description = "Returns appointments for the authenticated user")
    public ResponseEntity<List<Appointment>> getMyAppointments() {
        Long userId = getCurrentUserId();
        String role = getCurrentUserRole();
        logger.info("Received request to get appointments for user ID: {}", userId);
        List<Appointment> appointments = appointmentService.getUserAppointments(userId, role);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PATIENT', 'DOCTOR')")
    @Operation(summary = "Get appointment by ID", description = "Returns a specific appointment")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long id) {
        logger.info("Received request to get appointment with ID: {}", id);
        Appointment appointment = appointmentService.getAppointmentById(id);
        return new ResponseEntity<>(appointment, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PATIENT', 'DOCTOR')")
    @Operation(summary = "Update appointment", description = "Updates an existing appointment")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable Long id,
            @RequestBody Appointment updatedAppointment) {
        Long userId = getCurrentUserId();
        String role = getCurrentUserRole();
        logger.info("Received request to update appointment with ID: {} for user ID: {}", id, userId);
        Appointment appointment = appointmentService.updateAppointment(id, updatedAppointment, userId, role);
        return new ResponseEntity<>(appointment, HttpStatus.OK);
    }

    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "Get doctor's appointments", description = "Returns all appointments for a specific doctor")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(@PathVariable Long doctorId) {
        logger.info("Received request to get appointments for doctor ID: {}", doctorId);
        List<Appointment> appointments = appointmentService.getDoctorAppointments(doctorId);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }

    private Long getCurrentUserId() {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                var claims = jwtUtil.validateToken(token);
                Object idObj = claims.get("id");
                if (idObj != null) {
                    return Long.valueOf(idObj.toString());
                }
            } catch (Exception e) {
                logger.error("Failed to parse JWT for user id", e);
            }
        }
        throw new RuntimeException("User ID not found in JWT");
    }
    private String getCurrentUserRole() {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                var claims = jwtUtil.validateToken(token);
                Object roleObj = claims.get("role");
                if (roleObj != null) {
                    return roleObj.toString();
                }
            } catch (Exception e) {
                logger.error("Failed to parse JWT for user role", e);
            }
        }
        throw new RuntimeException("User role not found in JWT");
    }
}