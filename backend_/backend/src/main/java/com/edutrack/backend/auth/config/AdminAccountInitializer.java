package com.edutrack.backend.auth.config;

import com.edutrack.backend.auth.entity.UserAccount;
import com.edutrack.backend.auth.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Locale;

@Configuration
public class AdminAccountInitializer {

    @Bean
    public ApplicationRunner seedDefaultAdmin(
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.full-name:System Admin}") String adminFullName,
            @Value("${app.admin.it-number:IT00000000}") String adminItNumber,
            @Value("${app.admin.email:admin@edutrack.com}") String adminEmail,
            @Value("${app.admin.password:Admin@123}") String adminPassword) {
        return args -> {
            String normalizedEmail = adminEmail.trim().toLowerCase(Locale.ROOT);
            if (userAccountRepository.existsByEmailIgnoreCase(normalizedEmail)) {
                return;
            }

            UserAccount admin = new UserAccount();
            admin.setFullName(adminFullName.trim());
            admin.setItNumber(adminItNumber.trim().toUpperCase(Locale.ROOT));
            admin.setEmail(normalizedEmail);
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            admin.setRole("ADMIN");

            userAccountRepository.save(admin);
        };
    }
}