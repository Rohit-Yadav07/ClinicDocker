package com.patient_service.controller;

import com.patient_service.entity.MedicalHistory;
import com.patient_service.entity.Patient;
import com.patient_service.exception.UnauthorizedException;
import com.patient_service.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
// @CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class PatientController {
    private static final Logger logger = LoggerFactory.getLogger(PatientController.class);
    private final PatientService patientService;

    // @CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
    @GetMapping("/me")
    @PreAuthorize("hasAuthority('PATIENT')")
    @Operation(summary = "Get patient profile", description = "Returns the authenticated patient's full profile")
    public ResponseEntity<Patient> getPatientProfile() {
        Long userId = getCurrentUserId();
        String role = getCurrentUserRole();
        logger.info("Received request to get patient profile for user ID: {}", userId);
        Patient patient = patientService.getPatientProfile(userId, role);
        return new ResponseEntity<>(patient, HttpStatus.OK);
    }

    @PutMapping("/me")
    @PreAuthorize("hasAuthority('PATIENT')")
    @Operation(summary = "Update patient profile", description = "Updates the authenticated patient's profile")
    public ResponseEntity<Patient> updatePatientProfile(@RequestBody Patient updatedPatient) {
        Long userId = getCurrentUserId();
        String role = getCurrentUserRole();
        logger.info("Received request to update patient profile for user ID: {}", userId);
        Patient patient = patientService.updatePatientProfile(userId, updatedPatient, role);
        return new ResponseEntity<>(patient, HttpStatus.OK);
    }

    @PostMapping("/me/medical-history")
    @PreAuthorize("hasAuthority('PATIENT')")
    @Operation(summary = "Add medical history", description = "Adds a new medical history entry for the patient")
    public ResponseEntity<MedicalHistory> addMedicalHistory(@RequestParam String description) {
        Long userId = getCurrentUserId();
        String role = getCurrentUserRole();
        logger.info("Received request to add medical history for user ID: {}", userId);
        MedicalHistory history = patientService.addMedicalHistory(userId, description, role);
        return new ResponseEntity<>(history, HttpStatus.CREATED);
    }

    @PostMapping("/me/emergency-contact")
    @PreAuthorize("hasAuthority('PATIENT')")
    @Operation(summary = "Update emergency contact", description = "Updates the patient's emergency contact details")
    public ResponseEntity<Patient> updateEmergencyContact(@RequestParam String name, @RequestParam String number) {
        Long userId = getCurrentUserId();
        String role = getCurrentUserRole();
        logger.info("Received request to update emergency contact for user ID: {}", userId);
        Patient patient = patientService.updateEmergencyContact(userId, name, number, role);
        return new ResponseEntity<>(patient, HttpStatus.OK);
    }

    @GetMapping("/doctor/summary")
    @PreAuthorize("hasAuthority('DOCTOR')")
    @Operation(summary = "Get patient summary", description = "Returns a concise patient summary for doctors")
    public ResponseEntity<Patient> getPatientSummary(@RequestParam Long patientId) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        logger.info("Authorities for current user: {}", authentication.getAuthorities());
        logger.info("Received request to get patient summary for patient ID: {}", patientId);
        Patient summary = patientService.getPatientSummary(patientId);
        return new ResponseEntity<>(summary, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PATIENT')")
    @Operation(summary = "Create patient profile", description = "Creates a new patient profile")
    public ResponseEntity<Patient> createPatientProfile(@RequestBody Patient patient) {
        Long userId = getCurrentUserId();
        String role = getCurrentUserRole();
        logger.info("Received request to create patient profile for user ID: {}", userId);
        Patient createdPatient = patientService.createPatientProfile(userId, patient, role);
        return new ResponseEntity<>(createdPatient, HttpStatus.CREATED);
    }

    @GetMapping("/me/medical-history")
    public ResponseEntity<List<MedicalHistory>> getMedicalHistory() {
        Long userId = getCurrentUserId();
        String role = getCurrentUserRole();
        List<MedicalHistory> history = patientService.getMedicalHistory(userId, role);
        return ResponseEntity.ok(history);
    }

    private Long getCurrentUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            throw new UnauthorizedException("User is not authenticated");
        }

        // Get user ID from JWT token claims
        var details = authentication.getDetails();
        if (details instanceof Long) {
            return (Long) details;
        }

        throw new UnauthorizedException("User ID not found in authentication");
    }

    private String getCurrentUserRole() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User is not authenticated");
        }
        return authentication.getAuthorities().stream()
                .findFirst()
                .map(authority -> authority.getAuthority())
                .orElseThrow(() -> new UnauthorizedException("No role found for user"));
    }

    @GetMapping("/me/patients")
    @Operation(summary = "Get all patients (doctor only)", description = "Returns a list of all patients for doctors")
    public ResponseEntity<List<Patient>> getAllPatients() {
        logger.info("Doctor requested all patients");
        List<Patient> patients = patientService.getAllPatients();
        return new ResponseEntity<>(patients, HttpStatus.OK);
    }

}