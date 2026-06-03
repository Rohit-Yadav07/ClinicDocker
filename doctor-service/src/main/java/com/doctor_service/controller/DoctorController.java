package com.doctor_service.controller;

import com.doctor_service.DTO.PatientDTO.PatientDTO;
import com.doctor_service.entity.Doctor;
import com.doctor_service.service.DoctorService;
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
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {
    private static final Logger logger = LoggerFactory.getLogger(DoctorController.class);
    private final DoctorService doctorService;

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('DOCTOR')")
    @Operation(summary = "Get doctor profile", description = "Returns the authenticated doctor's full profile")
    public ResponseEntity<Doctor> getDoctorProfile() {
        Long userId = getCurrentUserId();
        String role = getCurrentUserRole();
        logger.info("Received request to get doctor profile for user ID: {}", userId);
        Doctor doctor = doctorService.getDoctorProfile(userId, role);
        return new ResponseEntity<>(doctor, HttpStatus.OK);
    }

    @PutMapping("/me")
    @PreAuthorize("hasAuthority('DOCTOR')")
    @Operation(summary = "Update doctor profile", description = "Updates the authenticated doctor's profile")
    public ResponseEntity<Doctor> updateDoctorProfile(@RequestBody Doctor updatedDoctor) {
        Long userId = getCurrentUserId();
        String role = getCurrentUserRole();
        logger.info("Received request to update doctor profile for user ID: {}", userId);
        Doctor doctor = doctorService.updateDoctorProfile(userId, updatedDoctor, role);
        return new ResponseEntity<>(doctor, HttpStatus.OK);
    }

    @GetMapping
    @Operation(summary = "Get all doctors", description = "Returns a list of all doctors")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        logger.info("Received request to get all doctors");
        List<Doctor> doctors = doctorService.getAllDoctors();
        return new ResponseEntity<>(doctors, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get doctor by ID", description = "Returns a specific doctor's profile")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        logger.info("Received request to get doctor with ID: {}", id);
        Doctor doctor = doctorService.getDoctorById(id);
        return new ResponseEntity<>(doctor, HttpStatus.OK);
    }

    @GetMapping("/specialty/{specialty}")
    @Operation(summary = "Get doctors by specialty", description = "Returns doctors with the specified specialty")
    public ResponseEntity<List<Doctor>> getDoctorsBySpecialty(@PathVariable String specialty) {
        logger.info("Received request to get doctors by specialty: {}", specialty);
        List<Doctor> doctors = doctorService.getDoctorsBySpecialty(specialty);
        return new ResponseEntity<>(doctors, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('DOCTOR')")
    @Operation(summary = "Create doctor profile", description = "Creates a new doctor profile")
    public ResponseEntity<Doctor> createDoctorProfile(@RequestBody Doctor doctor) {
        Long userId = getCurrentUserId();
        String role = getCurrentUserRole();
        logger.info("Received request to create doctor profile for user ID: {}", userId);
        Doctor createdDoctor = doctorService.createDoctorProfile(userId, doctor, role);
        return new ResponseEntity<>(createdDoctor, HttpStatus.CREATED);
    }

    // @GetMapping("/me/patient-summaries")
    // @PreAuthorize("hasAuthority('DOCTOR')")
    // @Operation(summary = "Get all patient summaries for doctor", description = "Returns all patient summaries for patients who have an appointment with the authenticated doctor")
    // public ResponseEntity<List<PatientDTO>> getAllPatientSummariesForDoctor() {
    //     Long doctorId = getCurrentUserId();
    //     logger.info("Received request to get all patient summaries for doctor ID: {}", doctorId);
    //     List<PatientDTO> summaries = doctorService.getAllPatientSummariesForDoctor(doctorId);
    //     return new ResponseEntity<>(summaries, HttpStatus.OK);
    // }

    @GetMapping("/me/patients")
    public ResponseEntity<List<PatientDTO>> getAllPatients() {
        System.out.println("Fetching all patients for the authenticated doctor");
        Long doctorId = getCurrentUserId();
        System.out.println("Doctor ID: " + doctorId);
        logger.info("Received request to get all patients for doctor ID: {}", doctorId);
        List<PatientDTO> patients = doctorService.getAllPatients();
        return new ResponseEntity<>(patients, HttpStatus.OK);
    }

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getDetails();
    }

    private String getCurrentUserRole() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().toString();
    }
}