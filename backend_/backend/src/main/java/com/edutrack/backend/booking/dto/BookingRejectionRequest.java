package com.edutrack.backend.booking.dto;

import jakarta.validation.constraints.NotBlank;

public class BookingRejectionRequest {

    @NotBlank(message = "Rejection reason is required")
    private String reason;

    public BookingRejectionRequest() {
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}