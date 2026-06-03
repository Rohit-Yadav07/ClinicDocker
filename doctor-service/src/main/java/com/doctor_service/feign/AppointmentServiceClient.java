package com.doctor_service.feign;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.doctor_service.DTO.AppointmentDTO.AppointmentDTO;
import com.doctor_service.config.FeignClientConfig;
@FeignClient(name = "appointment-service", url = "http://localhost:8085", configuration = FeignClientConfig.class)
public interface AppointmentServiceClient {
    @GetMapping("/api/appointments/doctor/{doctorId}")
    List<AppointmentDTO> getDoctorAppointments(@PathVariable("doctorId") Long doctorId);
}
