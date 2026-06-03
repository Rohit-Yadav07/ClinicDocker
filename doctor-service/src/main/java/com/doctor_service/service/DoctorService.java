package com.doctor_service.service;

import com.doctor_service.entity.Doctor;
import com.doctor_service.exception.ResourceNotFoundException;
import com.doctor_service.exception.UnauthorizedException;
import com.doctor_service.feign.UserServiceClient;
import com.doctor_service.feign.AppointmentServiceClient;
import com.doctor_service.feign.PatientServiceClient;
import com.doctor_service.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.ArrayList;
import java.util.Objects;
import java.util.stream.Collectors;

import com.doctor_service.DTO.PatientDTO.PatientDTO;
import com.doctor_service.DTO.AppointmentDTO.*;

@Service
@RequiredArgsConstructor
public class DoctorService {
    private static final Logger logger = LoggerFactory.getLogger(DoctorService.class);
    private final DoctorRepository doctorRepository;
    private final UserServiceClient userServiceClient;
    private final AppointmentServiceClient appointmentServiceClient;
    private final PatientServiceClient patientServiceClient;

    @Value("${user.service.url}")
    private String userServiceUrl;

    public Doctor getDoctorProfile(Long userId, String role) {
        logger.info("Fetching doctor profile for user ID: {}", userId);
        if (!role.contains("DOCTOR")) {
            throw new UnauthorizedException("Only doctors can access their full profile");
        }

        // Check if doctor profile exists, if not create a basic one
        Doctor doctor = doctorRepository.findById(userId).orElse(null);
        if (doctor == null) {
            logger.info("Doctor profile not found for user ID: {}, creating new profile", userId);
            doctor = new Doctor();
            doctor.setUserId(userId);
            doctor.setFirstName("");
            doctor.setLastName("");
            doctor = doctorRepository.save(doctor);
        }
        return doctor;
    }

    public Doctor updateDoctorProfile(Long userId, Doctor updatedDoctor, String role) {
        logger.info("Updating doctor profile for user ID: {}", userId);
        if (!role.contains("DOCTOR")) {
            throw new UnauthorizedException("Only doctors can update their profile");
        }
        Doctor doctor = doctorRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with user ID: " + userId));
        doctor.setFirstName(updatedDoctor.getFirstName());
        doctor.setLastName(updatedDoctor.getLastName());
        doctor.setSpecialty(updatedDoctor.getSpecialty());
        doctor.setConsultationFee(updatedDoctor.getConsultationFee());
        doctor.setAvailability(updatedDoctor.getAvailability());
        doctor.setLicenseNumber(updatedDoctor.getLicenseNumber());
        doctor.setQualifications(updatedDoctor.getQualifications());
        doctor.setYearsOfExperience(updatedDoctor.getYearsOfExperience());
        return doctorRepository.save(doctor);
    }

    public List<Doctor> getAllDoctors() {
        logger.info("Fetching all doctors");
        return doctorRepository.findAll();
    }

    public Doctor getDoctorById(Long id) {
        logger.info("Fetching doctor with ID: {}", id);
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + id));
    }

    public List<Doctor> getDoctorsBySpecialty(String specialty) {
        logger.info("Fetching doctors by specialty: {}", specialty);
        return doctorRepository.findBySpecialty(specialty);
    }

    public Doctor createDoctorProfile(Long userId, Doctor doctor, String role) {
        logger.info("Creating doctor profile for user ID: {}", userId);
        if (!role.contains("DOCTOR")) {
            throw new UnauthorizedException("Only doctors can create their profile");
        }

        // Validate that the user exists
        validateUser(userId);

        // Check if profile already exists
        if (doctorRepository.existsById(userId)) {
            throw new UnauthorizedException("Doctor profile already exists for user ID: " + userId);
        }

        // Set the user ID for the doctor profile
        doctor.setUserId(userId);

        return doctorRepository.save(doctor);
    }

    public void validateUser(Long userId) {
        logger.info("Validating user ID: {} with User Service", userId);
        Boolean exists = userServiceClient.validateUser(userId);
        logger.info("Response from user service: {}", exists);
        if (exists == null || !exists) {
            logger.error("User validation failed for ID: {}", userId);
            throw new ResourceNotFoundException("User not found with ID: " + userId);
        }
        logger.info("User validation successful for ID: {}", userId);
    }

    public List<PatientDTO> getAllPatients() {
        logger.info("Fetching all patients");
        List<PatientDTO> patients = patientServiceClient.getAllPatients();
        System.out.println(patients.toString());
        return patients;
    }

    /**
     * Returns all patients with their medical history from patient-service.
     */
    public List<PatientDTO> getAllPatientsWithHistory() {
        logger.info("Fetching all patients with medical history");
        List<PatientDTO> patients = patientServiceClient.getAllPatientsWithHistory();
        return patients;
    }
}