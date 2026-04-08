package com.edutrack.backend.auth.service;

import com.edutrack.backend.auth.dto.AuthResponse;
import com.edutrack.backend.auth.dto.ForgotPasswordRequest;
import com.edutrack.backend.auth.dto.LoginRequest;
import com.edutrack.backend.auth.dto.SignUpRequest;
import com.edutrack.backend.auth.entity.UserAccount;
import com.edutrack.backend.auth.exception.AuthException;
import com.edutrack.backend.auth.repository.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

    private static final String DEFAULT_ROLE = "STUDENT";

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserAccountRepository userAccountRepository, PasswordEncoder passwordEncoder) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse signUp(SignUpRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        String normalizedItNumber = normalizeItNumber(request.itNumber());

        if (!request.password().equals(request.confirmPassword())) {
            throw new AuthException("Passwords do not match");
        }

        if (userAccountRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new AuthException("An account with this email already exists");
        }

        if (userAccountRepository.existsByItNumberIgnoreCase(normalizedItNumber)) {
            throw new AuthException("An account with this IT number already exists");
        }

        UserAccount userAccount = new UserAccount();
        userAccount.setFullName(request.fullName().trim());
        userAccount.setItNumber(normalizedItNumber);
        userAccount.setEmail(normalizedEmail);
        userAccount.setPasswordHash(passwordEncoder.encode(request.password()));
        userAccount.setRole(DEFAULT_ROLE);

        UserAccount saved = userAccountRepository.save(userAccount);

        return AuthResponse.success(
                "Signup successful",
                saved.getId(),
                saved.getEmail(),
                saved.getItNumber(),
                saved.getFullName(),
                saved.getRole()
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());

        UserAccount userAccount = userAccountRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new AuthException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), userAccount.getPasswordHash())) {
            throw new AuthException("Invalid email or password");
        }

        return AuthResponse.success(
                "Login successful",
                userAccount.getId(),
                userAccount.getEmail(),
                userAccount.getItNumber(),
                userAccount.getFullName(),
                userAccount.getRole()
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse forgotPassword(ForgotPasswordRequest request) {
        String normalizedEmail = normalizeEmail(request.email());

        boolean accountExists = userAccountRepository.existsByEmailIgnoreCase(normalizedEmail);
        if (!accountExists) {
            return AuthResponse.messageOnly("If the email exists, a password reset link has been sent.");
        }

        return AuthResponse.messageOnly("If the email exists, a password reset link has been sent.");
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeItNumber(String itNumber) {
        return itNumber.trim().toUpperCase(Locale.ROOT);
    }
}
