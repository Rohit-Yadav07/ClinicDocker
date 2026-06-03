package com.appointment_service.feign;

import com.appointment_service.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", url = "${user.service.url}", configuration = FeignConfig.class)
public interface UserServiceClient {
    @GetMapping("/{userId}")
    Object getUserById(@PathVariable("userId") Long userId);
}
