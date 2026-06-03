package com.patient_service.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "patients")
@Data
public class Patient {
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

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private java.util.List<MedicalHistory> medicalHistory;
}

enum Gender {
    MALE, FEMALE, OTHER
}