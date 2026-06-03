package com.appointment_service.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "doctor-service", url = "${doctor.service.url}")
public interface DoctorServiceClient {
    @GetMapping("/{doctorId}")
    Object getDoctorById(@PathVariable("doctorId") Long doctorId);
}
