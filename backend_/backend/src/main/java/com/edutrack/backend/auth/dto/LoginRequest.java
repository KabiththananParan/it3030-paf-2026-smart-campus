package com.edutrack.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;

public record LoginRequest(
                @NotBlank(message = "Email is required") @Email(message = "Email must be a valid email address") String email,

                @NotBlank(message = "Password is required") String password) {
}
