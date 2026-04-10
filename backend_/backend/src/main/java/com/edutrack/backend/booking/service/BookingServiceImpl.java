package com.edutrack.backend.booking.service;

import com.edutrack.backend.booking.dto.*;
import com.edutrack.backend.booking.entity.Booking;
import com.edutrack.backend.booking.entity.BookingStatus;
import com.edutrack.backend.booking.exception.BookingConflictException;
import com.edutrack.backend.booking.exception.BookingNotFoundException;
import com.edutrack.backend.booking.exception.InvalidBookingStateException;
import com.edutrack.backend.booking.exception.UnauthorizedBookingActionException;
import com.edutrack.backend.booking.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    public BookingServiceImpl(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Override
    public BookingResponse createBooking(Long userId, BookingCreateRequest request) {
        validateTimeRange(request.getStartTime(), request.getEndTime());
        validateBookingConflict(
                request.getResourceId(),
                request.getBookingDate(),
                request.getStartTime(),
                request.getEndTime(),
                null
        );

        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setResourceId(request.getResourceId());
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        Booking savedBooking = bookingRepository.save(booking);
        return mapToResponse(savedBooking);
    }

    @Override
    public List<BookingResponse> getMyBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse updateBooking(Long bookingId, Long userId, BookingUpdateRequest request) {
        Booking booking = getBookingById(bookingId);

        if (!booking.getUserId().equals(userId)) {
            throw new UnauthorizedBookingActionException("You are not allowed to update this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingStateException("Only pending bookings can be updated");
        }

        validateTimeRange(request.getStartTime(), request.getEndTime());
        validateBookingConflict(
                request.getResourceId(),
                request.getBookingDate(),
                request.getStartTime(),
                request.getEndTime(),
                booking.getId()
        );

        booking.setResourceId(request.getResourceId());
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());

        Booking updatedBooking = bookingRepository.save(booking);
        return mapToResponse(updatedBooking);
    }

    @Override
    public BookingResponse approveBooking(Long bookingId, BookingApprovalRequest request) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingStateException("Only pending bookings can be approved");
        }

        validateBookingConflict(
                booking.getResourceId(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getId()
        );

        booking.setStatus(BookingStatus.APPROVED);

        Booking updatedBooking = bookingRepository.save(booking);
        return mapToResponse(updatedBooking);
    }

    @Override
    public BookingResponse rejectBooking(Long bookingId, BookingRejectionRequest request) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingStateException("Only pending bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(request.getReason());

        Booking updatedBooking = bookingRepository.save(booking);
        return mapToResponse(updatedBooking);
    }

    @Override
    public BookingResponse cancelBooking(Long bookingId, Long userId, BookingCancelRequest request) {
        Booking booking = getBookingById(bookingId);

        if (!booking.getUserId().equals(userId)) {
            throw new UnauthorizedBookingActionException("You are not allowed to cancel this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new InvalidBookingStateException("Only pending or approved bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelReason(request.getReason());

        Booking updatedBooking = bookingRepository.save(booking);
        return mapToResponse(updatedBooking);
    }

    private Booking getBookingById(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + bookingId));
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new InvalidBookingStateException("Start time must be before end time");
        }
    }

    private void validateBookingConflict(Long resourceId,
                                         java.time.LocalDate bookingDate,
                                         LocalTime startTime,
                                         LocalTime endTime,
                                         Long currentBookingId) {

        List<BookingStatus> blockingStatuses = List.of(BookingStatus.PENDING, BookingStatus.APPROVED);

        List<Booking> existingBookings = bookingRepository
                .findByResourceIdAndBookingDateAndStatusIn(resourceId, bookingDate, blockingStatuses);

        for (Booking existingBooking : existingBookings) {
            if (currentBookingId != null && existingBooking.getId().equals(currentBookingId)) {
                continue;
            }

            boolean isOverlapping =
                    startTime.isBefore(existingBooking.getEndTime()) &&
                    endTime.isAfter(existingBooking.getStartTime());

            if (isOverlapping) {
                throw new BookingConflictException("Booking conflict: selected time slot is already reserved");
            }
        }
    }

    private BookingResponse mapToResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setUserId(booking.getUserId());
        response.setResourceId(booking.getResourceId());
        response.setBookingDate(booking.getBookingDate());
        response.setStartTime(booking.getStartTime());
        response.setEndTime(booking.getEndTime());
        response.setPurpose(booking.getPurpose());
        response.setExpectedAttendees(booking.getExpectedAttendees());
        response.setStatus(booking.getStatus());
        response.setRejectionReason(booking.getRejectionReason());
        response.setCancelReason(booking.getCancelReason());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        return response;
    }
}
