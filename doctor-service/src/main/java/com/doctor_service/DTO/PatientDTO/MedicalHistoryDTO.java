package com.doctor_service.DTO.PatientDTO;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MedicalHistoryDTO {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientDTO patient;

    @Column(nullable = false)
    private String description;

    private LocalDateTime recordedAt;
}