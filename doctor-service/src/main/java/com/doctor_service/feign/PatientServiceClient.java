package com.doctor_service.feign;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import com.doctor_service.DTO.PatientDTO.PatientDTO;
import com.doctor_service.config.FeignClientConfig;

@FeignClient(name = "patient-service", url = "http://localhost:8082")
public interface PatientServiceClient {
    @GetMapping("/api/patients/me/patients")
    List<PatientDTO> getAllPatients();

    @GetMapping("/api/patients/all-with-history")
    List<PatientDTO> getAllPatientsWithHistory();
}
