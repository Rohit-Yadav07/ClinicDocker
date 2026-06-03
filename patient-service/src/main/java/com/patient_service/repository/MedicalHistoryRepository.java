package com.patient_service.repository;

import com.patient_service.entity.MedicalHistory;
import com.patient_service.entity.Patient;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicalHistoryRepository extends JpaRepository<MedicalHistory, Long> {

    List<MedicalHistory> findByPatient(Patient patient);
}