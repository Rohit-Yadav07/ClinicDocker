package com.doctor_service.DTO.PatientDTO;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PatientDTO {
    @Id
    private Long userId;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String contactNumber;

    private String address;

    private String bloodType;

    private String emergencyContactName;

    private String emergencyContactNumber;

    private String insuranceProvider;

    private String insurancePolicyNumber;
}

enum Gender {
    MALE, FEMALE, OTHER
}