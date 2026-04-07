package com.edutrack.backend.booking.service;

import com.edutrack.backend.booking.dto.AdminDecisionRequest;
import com.edutrack.backend.booking.dto.BookingBatchResponse;
import com.edutrack.backend.booking.dto.BookingResponse;
import com.edutrack.backend.booking.dto.CreateBookingRequest;
import com.edutrack.backend.booking.dto.UpdateBookingRequest;
import com.edutrack.backend.booking.entity.Booking;
import com.edutrack.backend.booking.enums.BookingStatus;
import com.edutrack.backend.booking.exception.BookingException;
import com.edutrack.backend.booking.repository.BookingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class BookingService {

    private static final List<BookingStatus> ACTIVE_BOOKING_STATUSES = List.of(
            BookingStatus.PENDING,
            BookingStatus.APPROVED);
    private static final LocalTime BUSINESS_DAY_END = LocalTime.of(22, 0);

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public BookingBatchResponse createBooking(CreateBookingRequest request) {
        validateTimeRange(request.startTime(), request.endTime());

        int recurrenceCount = request.recurrenceCount() == null ? 1 : request.recurrenceCount();
        String recurrenceGroupId = recurrenceCount > 1 ? UUID.randomUUID().toString() : null;

        List<BookingResponse> createdBookings = new ArrayList<>();
        for (int i = 0; i < recurrenceCount; i++) {
            LocalDate targetDate = request.bookingDate().plusWeeks(i);
            ensureNoOverlap(
                    request.resourceName().trim(),
                    targetDate,
                    request.startTime(),
                    request.endTime(),
                    null);

            Booking booking = new Booking();
            booking.setRequesterName(request.requesterName().trim());
            booking.setRequesterEmail(normalizeEmail(request.requesterEmail()));
            booking.setRequesterItNumber(normalizeItNumber(request.requesterItNumber()));
            booking.setResourceType(request.resourceType().trim());
            booking.setResourceName(request.resourceName().trim());
            booking.setPurpose(request.purpose().trim());
            booking.setBookingDate(targetDate);
            booking.setStartTime(request.startTime());
            booking.setEndTime(request.endTime());
            booking.setStatus(BookingStatus.PENDING);
            booking.setRecurrenceGroupId(recurrenceGroupId);
            booking.setRecurrenceIndex(recurrenceCount > 1 ? i + 1 : null);

            Booking saved = bookingRepository.save(booking);
            createdBookings.add(BookingResponse.from(saved));
        }

        String message = recurrenceCount > 1
                ? "Recurring booking requests submitted successfully"
                : "Booking request submitted successfully";
        return new BookingBatchResponse(message, createdBookings);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(String requesterEmail) {
        String normalizedEmail = normalizeEmail(requesterEmail);
        return bookingRepository.findByRequesterEmailIgnoreCaseOrderByBookingDateAscStartTimeAsc(normalizedEmail)
                .stream()
                .map(BookingResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookings(BookingStatus status) {
        List<Booking> bookings = status == null
                ? bookingRepository.findAllByOrderByBookingDateAscStartTimeAsc()
                : bookingRepository.findByStatusOrderByBookingDateAscStartTimeAsc(status);

        return bookings.stream().map(BookingResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getCalendarBookings(LocalDate from, LocalDate to, String requesterEmail) {
        LocalDate rangeStart = from == null ? LocalDate.now().minusDays(7) : from;
        LocalDate rangeEnd = to == null ? LocalDate.now().plusDays(30) : to;

        List<Booking> bookings;
        if (requesterEmail != null && !requesterEmail.isBlank()) {
            bookings = bookingRepository
                    .findByRequesterEmailIgnoreCaseAndBookingDateBetweenOrderByBookingDateAscStartTimeAsc(
                            normalizeEmail(requesterEmail),
                            rangeStart,
                            rangeEnd);
        } else {
            bookings = bookingRepository.findByBookingDateBetweenOrderByBookingDateAscStartTimeAsc(rangeStart,
                    rangeEnd);
        }

        return bookings.stream().map(BookingResponse::from).toList();
    }

    @Transactional
    public BookingResponse updateBooking(Long id, String requesterEmail, UpdateBookingRequest request) {
        Booking booking = findBookingOrThrow(id);
        verifyOwnership(booking, requesterEmail);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BookingException("Only pending bookings can be updated", HttpStatus.CONFLICT);
        }

        validateTimeRange(request.startTime(), request.endTime());
        ensureNoOverlap(
                request.resourceName().trim(),
                request.bookingDate(),
                request.startTime(),
                request.endTime(),
                booking.getId());

        booking.setResourceType(request.resourceType().trim());
        booking.setResourceName(request.resourceName().trim());
        booking.setPurpose(request.purpose().trim());
        booking.setBookingDate(request.bookingDate());
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());

        Booking saved = bookingRepository.save(booking);
        return BookingResponse.from(saved);
    }

    @Transactional
    public BookingResponse approveBooking(Long id, AdminDecisionRequest request) {
        Booking booking = findBookingOrThrow(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BookingException("Only pending bookings can be approved", HttpStatus.CONFLICT);
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setAdminNote(trimToNull(request.adminNote(), "Approved by admin"));
        booking.setQrToken(UUID.randomUUID().toString());
        booking.setCheckedIn(false);
        booking.setCheckedInAt(null);

        return BookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse rejectBooking(Long id, AdminDecisionRequest request) {
        Booking booking = findBookingOrThrow(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BookingException("Only pending bookings can be rejected", HttpStatus.CONFLICT);
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminNote(trimToNull(request.adminNote(), "Rejected by admin"));
        booking.setQrToken(null);
        booking.setCheckedIn(false);
        booking.setCheckedInAt(null);

        return BookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse checkIn(Long id, String token) {
        Booking booking = findBookingOrThrow(id);

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new BookingException("Only approved bookings can be checked in", HttpStatus.CONFLICT);
        }

        if (booking.isCheckedIn()) {
            throw new BookingException("Booking is already checked in", HttpStatus.CONFLICT);
        }

        if (booking.getQrToken() == null || !booking.getQrToken().equals(token)) {
            throw new BookingException("Invalid QR token", HttpStatus.UNAUTHORIZED);
        }

        booking.setCheckedIn(true);
        booking.setCheckedInAt(LocalDateTime.now());
        return BookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse cancelBooking(Long id, String requesterEmail) {
        Booking booking = findBookingOrThrow(id);
        verifyOwnership(booking, requesterEmail);

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new BookingException("Only pending or approved bookings can be cancelled", HttpStatus.CONFLICT);
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setAdminNote("Cancelled by requester");
        booking.setQrToken(null);
        booking.setCheckedIn(false);
        booking.setCheckedInAt(null);

        Booking saved = bookingRepository.save(booking);
        return BookingResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        return BookingResponse.from(findBookingOrThrow(id));
    }

    private void ensureNoOverlap(
            String resourceName,
            LocalDate bookingDate,
            LocalTime startTime,
            LocalTime endTime,
            Long excludeBookingId) {
        boolean overlap = excludeBookingId == null
                ? bookingRepository.existsOverlappingBooking(
                        resourceName,
                        bookingDate,
                        startTime,
                        endTime,
                        ACTIVE_BOOKING_STATUSES)
                : bookingRepository.existsOverlappingBookingExcludingId(
                        resourceName,
                        bookingDate,
                        startTime,
                        endTime,
                        ACTIVE_BOOKING_STATUSES,
                        excludeBookingId);

        if (overlap) {
            List<String> suggestions = suggestAlternativeSlots(resourceName, bookingDate, startTime, endTime);
            throw new BookingException(
                    "Selected slot overlaps with an existing booking",
                    HttpStatus.CONFLICT,
                    suggestions);
        }
    }

    private List<String> suggestAlternativeSlots(
            String resourceName,
            LocalDate bookingDate,
            LocalTime requestedStart,
            LocalTime requestedEnd) {
        long durationMinutes = Math.max(30, ChronoUnit.MINUTES.between(requestedStart, requestedEnd));
        LocalTime candidateStart = requestedEnd;
        List<String> suggestions = new ArrayList<>();

        while (suggestions.size() < 3) {
            LocalTime candidateEnd = candidateStart.plusMinutes(durationMinutes);
            if (candidateEnd.isAfter(BUSINESS_DAY_END)) {
                break;
            }

            boolean hasConflict = bookingRepository.existsOverlappingBooking(
                    resourceName,
                    bookingDate,
                    candidateStart,
                    candidateEnd,
                    ACTIVE_BOOKING_STATUSES);

            if (!hasConflict) {
                suggestions.add(candidateStart + " - " + candidateEnd);
            }

            candidateStart = candidateStart.plusMinutes(30);
        }

        if (suggestions.isEmpty()) {
            suggestions.add("Try another time or another resource");
        }
        return suggestions;
    }

    private void verifyOwnership(Booking booking, String requesterEmail) {
        String normalized = normalizeEmail(requesterEmail);
        if (!booking.getRequesterEmail().equalsIgnoreCase(normalized)) {
            throw new BookingException("You can only modify your own booking", HttpStatus.FORBIDDEN);
        }
    }

    private Booking findBookingOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new BookingException("Booking not found"));
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new BookingException("Start time must be before end time");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeItNumber(String itNumber) {
        return itNumber.trim().toUpperCase(Locale.ROOT);
    }

    private String trimToNull(String value, String fallback) {
        if (value == null || value.trim().isBlank()) {
            return fallback;
        }
        return value.trim();
    }
}
