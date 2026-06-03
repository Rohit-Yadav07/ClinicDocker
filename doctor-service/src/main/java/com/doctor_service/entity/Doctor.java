package com.doctor_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "doctors")
@Data
public class Doctor {
    @Id
    private Long userId;

    // @Column(nullable = false)
    private String firstName;

    // @Column(nullable = false)
    private String lastName;

    private String specialty;

    private Double consultationFee;

    private String availability;

    private String licenseNumber;

    private String qualifications;

    private Integer yearsOfExperience;
}