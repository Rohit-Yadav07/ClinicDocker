package com.patient_service.service;

import com.patient_service.entity.MedicalHistory;
import com.patient_service.entity.Patient;
import com.patient_service.exception.ResourceNotFoundException;
import com.patient_service.exception.UnauthorizedException;
import com.patient_service.feign.UserServiceClient;
import com.patient_service.repository.MedicalHistoryRepository;
import com.patient_service.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientService {
    private static final Logger logger = LoggerFactory.getLogger(PatientService.class);
    private final PatientRepository patientRepository;
    private final MedicalHistoryRepository medicalHistoryRepository;
    private final UserServiceClient userServiceClient;

    public Patient getPatientProfile(Long userId, String role) {
        logger.info("Fetching patient profile for user ID: {}", userId);
        if (!role.contains("PATIENT")) {
            throw new UnauthorizedException("Only patients can access their full profile");
        }
        
        // Check if patient profile exists, if not create a basic one
        Patient patient = patientRepository.findById(userId).orElse(null);
        if (patient == null) {
            logger.info("Patient profile not found for user ID: {}, creating new profile", userId);
            patient = new Patient();
            patient.setUserId(userId);
            patient.setFirstName("");
            patient.setLastName("");
            patient = patientRepository.save(patient);
        }
        return patient;
    }

    public Patient updatePatientProfile(Long userId, Patient updatedPatient, String role) {
        logger.info("Updating patient profile for user ID: {}", userId);
        if (!role.contains("PATIENT")) {
            throw new UnauthorizedException("Only patients can update their profile");
        }
        Patient patient = patientRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with user ID: " + userId));
        patient.setFirstName(updatedPatient.getFirstName());
        patient.setLastName(updatedPatient.getLastName());
        patient.setDateOfBirth(updatedPatient.getDateOfBirth());
        patient.setGender(updatedPatient.getGender());
        patient.setContactNumber(updatedPatient.getContactNumber());
        patient.setAddress(updatedPatient.getAddress());
        patient.setBloodType(updatedPatient.getBloodType());
        patient.setInsuranceProvider(updatedPatient.getInsuranceProvider());
        patient.setInsurancePolicyNumber(updatedPatient.getInsurancePolicyNumber());
        return patientRepository.save(patient);
    }

    public MedicalHistory addMedicalHistory(Long userId, String description, String role) {
        logger.info("Adding medical history for user ID: {}", userId);
        if (!role.contains("PATIENT")) {
            throw new UnauthorizedException("Only patients can add medical history");
        }
        Patient patient = patientRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with user ID: " + userId));
        MedicalHistory history = new MedicalHistory();
        history.setPatient(patient);
        history.setDescription(description);
        history.setRecordedAt(LocalDateTime.now());
        return medicalHistoryRepository.save(history);
    }

    public Patient updateEmergencyContact(Long userId, String name, String number, String role) {
        logger.info("Updating emergency contact for user ID: {}", userId);
        if (!role.contains("PATIENT")) {
            throw new UnauthorizedException("Only patients can update emergency contact");
        }
        Patient patient = patientRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with user ID: " + userId));
        patient.setEmergencyContactName(name);
        patient.setEmergencyContactNumber(number);
        return patientRepository.save(patient);
    }

    public Patient getPatientSummary(Long userId) {
        logger.info("Fetching patient summary for user ID: {}", userId);
        Patient patient = patientRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with user ID: " + userId));
        Patient summary = new Patient();
        summary.setUserId(patient.getUserId());
        summary.setFirstName(patient.getFirstName());
        summary.setLastName(patient.getLastName());
        summary.setBloodType(patient.getBloodType());
        summary.setEmergencyContactName(patient.getEmergencyContactName());
        summary.setEmergencyContactNumber(patient.getEmergencyContactNumber());
        return summary;
    }

    // Validate user with User Service
    public void validateUser(Long userId) {
        logger.info("Validating user ID: {} with User Service", userId);
        Boolean exists = userServiceClient.userExists(userId);
        if (exists == null || !exists) {
            throw new ResourceNotFoundException("User not found with ID: " + userId);
        }
    }

    public Patient createPatientProfile(Long userId, Patient patient, String role) {
        logger.info("Creating patient profile for user ID: {}", userId);
        if (!role.contains("PATIENT")) {
            throw new UnauthorizedException("Only patients can create their profile");
        }

        // Validate that the user exists
        validateUser(userId);

        // Check if profile already exists
        if (patientRepository.existsById(userId)) {
            throw new UnauthorizedException("Patient profile already exists for user ID: " + userId);
        }

        // Set the user ID for the patient profile
        patient.setUserId(userId);

        return patientRepository.save(patient);
    }

    public List<MedicalHistory> getMedicalHistory(Long userId, String role) {
        logger.info("Fetching medical history for user ID: {}", userId);
        if (!role.contains("PATIENT")) {
            throw new UnauthorizedException("Only patients can access their medical history");
        }
        Patient patient = patientRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with user ID: " + userId));
        List<MedicalHistory> history = medicalHistoryRepository.findByPatient(patient);
        if (history.isEmpty()) {
            throw new ResourceNotFoundException("No medical history found for patient with user ID: " + userId);
        }
        return history;
    }
    public List<Patient> getAllPatients() {
        logger.info("Fetching all patients");
        return patientRepository.findAll();
    }

    public Patient getPatientWithMedicalHistory(Long patientId) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getPatientWithMedicalHistory'");
    }
}