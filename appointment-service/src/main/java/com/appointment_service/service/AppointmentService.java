package com.appointment_service.service;

import com.appointment_service.entity.Appointment;
import com.appointment_service.repository.AppointmentRepository;
import com.appointment_service.exception.ResourceNotFoundException;
import com.appointment_service.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.appointment_service.feign.UserServiceClient;
import com.appointment_service.feign.DoctorServiceClient;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {
    private static final Logger logger = LoggerFactory.getLogger(AppointmentService.class);
    private final AppointmentRepository appointmentRepository;
    private final UserServiceClient userServiceClient;
    private final DoctorServiceClient doctorServiceClient;

    public Appointment bookAppointment(Appointment appointment, String role) {
        logger.info("Booking appointment for patient ID: {} with doctor ID: {}",
                appointment.getPatientId(), appointment.getDoctorId());

        if (!role.equals("PATIENT")) {
            throw new UnauthorizedException("Only patients can book appointments");
        }

        // Validate patient and doctor existence
        validateUser(appointment.getPatientId());
        validateDoctor(appointment.getDoctorId());

        // Check doctor availability (simplified check; could integrate with Doctor
        // Service)
        appointment.setStatus("SCHEDULED");
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getUserAppointments(Long userId, String role) {
        logger.info("Fetching appointments for user ID: {}", userId);
        if (role.equals("PATIENT")) {
            return appointmentRepository.findByPatientId(userId);
        } else if (role.equals("DOCTOR")) {
            return appointmentRepository.findByDoctorId(userId);
        } else {
            throw new UnauthorizedException("Invalid role for fetching appointments");
        }
    }

    public Appointment getAppointmentById(Long id) {
        logger.info("Fetching appointment with ID: {}", id);
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
    }

    public Appointment updateAppointment(Long id, Appointment updatedAppointment, Long userId, String role) {
        logger.info("Updating appointment with ID: {}", id);
        Appointment appointment = getAppointmentById(id);

        if (!appointment.getPatientId().equals(userId) && !appointment.getDoctorId().equals(userId)) {
            throw new UnauthorizedException("You can only update your own appointments");
        }

        appointment.setAppointmentTime(updatedAppointment.getAppointmentTime());
        appointment.setStatus(updatedAppointment.getStatus());
        appointment.setNotes(updatedAppointment.getNotes());
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getDoctorAppointments(Long doctorId) {
        logger.info("Fetching appointments for doctor ID: {}", doctorId);
        validateDoctor(doctorId);
        return appointmentRepository.findByDoctorId(doctorId);
        
    }

    private void validateUser(Long userId) {
        logger.info("Validating user ID: {} with User Service", userId);
        try {
            Object user = userServiceClient.getUserById(userId);
            if (user == null) {
                throw new ResourceNotFoundException("User not found with ID: " + userId);
            }
        } catch (Exception e) {
            throw new ResourceNotFoundException("User not found with ID: " + userId);
        }
    }

    private void validateDoctor(Long doctorId) {
        logger.info("Validating doctor ID: {} with Doctor Service", doctorId);
        try {
            Object doctor = doctorServiceClient.getDoctorById(doctorId);
            if (doctor == null) {
                throw new ResourceNotFoundException("Doctor not found with ID: " + doctorId);
            }
        } catch (Exception e) {
            throw new ResourceNotFoundException("Doctor not found with ID: " + doctorId);
        }
    }
}