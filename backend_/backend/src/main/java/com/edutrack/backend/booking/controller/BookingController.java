package com.edutrack.backend.booking.controller;

import com.edutrack.backend.booking.dto.*;
import com.edutrack.backend.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @RequestParam Long userId,
            @Valid @RequestBody BookingCreateRequest request
    ) {
        BookingResponse response = bookingService.createBooking(userId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(@RequestParam Long userId) {
        return ResponseEntity.ok(bookingService.getMyBookings(userId));
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable Long id,
            @RequestParam Long userId,
            @Valid @RequestBody BookingUpdateRequest request
    ) {
        return ResponseEntity.ok(bookingService.updateBooking(id, userId, request));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<BookingResponse> approveBooking(
            @PathVariable Long id,
            @RequestBody(required = false) BookingApprovalRequest request
    ) {
        if (request == null) {
            request = new BookingApprovalRequest();
        }
        return ResponseEntity.ok(bookingService.approveBooking(id, request));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingRejectionRequest request
    ) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, request));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            @RequestParam Long userId,
            @Valid @RequestBody BookingCancelRequest request
    ) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, userId, request));
    }
}
