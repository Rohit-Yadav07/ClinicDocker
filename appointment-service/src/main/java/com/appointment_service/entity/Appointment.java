package com.appointment_service.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Data
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long patientId; // Maps to User.id from User Service

    @Column(nullable = false)
    private Long doctorId; // Maps to Doctor.userId from Doctor Service

    @Column(nullable = false)
    private LocalDateTime appointmentTime;

    private String status; // e.g., "SCHEDULED", "COMPLETED", "CANCELLED"

    private String notes;

}