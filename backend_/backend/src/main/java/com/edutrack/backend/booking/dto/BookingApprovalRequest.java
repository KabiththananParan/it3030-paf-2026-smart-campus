package com.edutrack.backend.booking.dto;

public class BookingApprovalRequest {

    private String adminNote;

    public BookingApprovalRequest() {
    }

    public String getAdminNote() {
        return adminNote;
    }

    public void setAdminNote(String adminNote) {
        this.adminNote = adminNote;
    }
}