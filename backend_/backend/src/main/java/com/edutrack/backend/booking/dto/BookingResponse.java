package com.edutrack.backend.booking.dto;

import com.edutrack.backend.booking.entity.Booking;
import com.edutrack.backend.booking.enums.BookingStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record BookingResponse(
        Long id,
        String requesterName,
        String requesterEmail,
        String requesterItNumber,
        String resourceType,
        String resourceName,
        String purpose,
        LocalDate bookingDate,
        LocalTime startTime,
        LocalTime endTime,
        BookingStatus status,
        String adminNote,
        String qrToken,
        boolean checkedIn,
        LocalDateTime checkedInAt,
        String recurrenceGroupId,
        Integer recurrenceIndex,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
    public static BookingResponse from(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getRequesterName(),
                booking.getRequesterEmail(),
                booking.getRequesterItNumber(),
                booking.getResourceType(),
                booking.getResourceName(),
                booking.getPurpose(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getStatus(),
                booking.getAdminNote(),
                booking.getQrToken(),
                booking.isCheckedIn(),
                booking.getCheckedInAt(),
                booking.getRecurrenceGroupId(),
                booking.getRecurrenceIndex(),
                booking.getCreatedAt(),
                booking.getUpdatedAt());
    }
}
