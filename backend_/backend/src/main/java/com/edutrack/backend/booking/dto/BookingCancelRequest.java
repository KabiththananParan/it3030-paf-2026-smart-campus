package com.edutrack.backend.booking.dto;

import jakarta.validation.constraints.NotBlank;

public class BookingCancelRequest {

    @NotBlank(message = "Cancel reason is required")
    private String reason;

    public BookingCancelRequest() {
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}