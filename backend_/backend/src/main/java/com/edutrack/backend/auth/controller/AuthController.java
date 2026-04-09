package com.edutrack.backend.auth.controller;

import com.edutrack.backend.auth.dto.AuthResponse;
import com.edutrack.backend.auth.dto.AdminCreateAccountRequest;
import com.edutrack.backend.auth.dto.ForgotPasswordRequest;
import com.edutrack.backend.auth.dto.LoginRequest;
import com.edutrack.backend.auth.dto.SignUpRequest;
import com.edutrack.backend.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signUp(@Valid @RequestBody SignUpRequest request) {
        AuthResponse response = authService.signUp(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<AuthResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        AuthResponse response = authService.forgotPassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/users")
    public ResponseEntity<AuthResponse> createAdminAccount(@Valid @RequestBody AdminCreateAccountRequest request) {
        AuthResponse response = authService.createAccountByAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
