package com.user_service.controller;

import com.user_service.entity.User;
import com.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

// @CrossOrigin()
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final UserService userService;

    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestParam String username, @RequestParam String password) {
        logger.info("Received login request for user: {}", username);
        String token = userService.loginUser(username, password);
        return new ResponseEntity<>(token, HttpStatus.OK);
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        logger.info("Received registration request for user: {}", user.getUsername());
        User registeredUser = userService.registerUser(user);
        return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        // Extract user ID from the JWT token via SecurityContext
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.getUserById(
                userService.getUserByUsername(username).getId());
        return new ResponseEntity<>(user, HttpStatus.OK);
    }
}