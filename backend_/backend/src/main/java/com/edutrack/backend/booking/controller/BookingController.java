package com.edutrack.backend.booking.controller;

import com.edutrack.backend.booking.dto.AdminDecisionRequest;
import com.edutrack.backend.booking.dto.BookingBatchResponse;
import com.edutrack.backend.booking.dto.BookingResponse;
import com.edutrack.backend.booking.dto.BookingSummaryResponse;
import com.edutrack.backend.booking.dto.CreateBookingRequest;
import com.edutrack.backend.booking.dto.UpdateBookingRequest;
import com.edutrack.backend.booking.enums.BookingStatus;
import com.edutrack.backend.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingBatchResponse> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        BookingBatchResponse response = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(@RequestParam String email) {
        return ResponseEntity.ok(bookingService.getMyBookings(email));
    }

    @GetMapping("/my/upcoming")
    public ResponseEntity<List<BookingResponse>> getMyUpcomingBookings(
            @RequestParam String email,
            @RequestParam(defaultValue = "14") int days) {
        return ResponseEntity.ok(bookingService.getMyUpcomingBookings(email, days));
    }

    @GetMapping("/my/summary")
    public ResponseEntity<BookingSummaryResponse> getMyBookingSummary(@RequestParam String email) {
        return ResponseEntity.ok(bookingService.getMyBookingSummary(email));
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getBookings(
            @RequestParam(required = false) BookingStatus status) {
        List<BookingResponse> bookings = bookingService.getBookings(status);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/calendar")
    public ResponseEntity<List<BookingResponse>> getCalendarBookings(
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            @RequestParam(required = false) String email) {
        return ResponseEntity.ok(bookingService.getCalendarBookings(from, to, email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        BookingResponse booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable Long id,
            @RequestParam String email,
            @Valid @RequestBody UpdateBookingRequest request) {
        BookingResponse updated = bookingService.updateBooking(id, email, request);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<BookingResponse> approveBooking(
            @PathVariable Long id,
            @Valid @RequestBody AdminDecisionRequest request) {
        BookingResponse updated = bookingService.approveBooking(id, request);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable Long id,
            @Valid @RequestBody AdminDecisionRequest request) {
        BookingResponse updated = bookingService.rejectBooking(id, request);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            @RequestParam String email) {
        BookingResponse updated = bookingService.cancelBooking(id, email);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable Long id,
            @RequestParam String email) {
        bookingService.deleteBooking(id, email);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/check-in")
    public ResponseEntity<BookingResponse> checkIn(
            @PathVariable Long id,
            @RequestParam String token) {
        BookingResponse updated = bookingService.checkIn(id, token);
        return ResponseEntity.ok(updated);
    }
}
