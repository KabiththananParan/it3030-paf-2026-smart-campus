package com.edutrack.backend.booking.service;

import com.edutrack.backend.booking.dto.*;

import java.util.List;

public interface BookingService {

    BookingResponse createBooking(Long userId, BookingCreateRequest request);

    List<BookingResponse> getMyBookings(Long userId);

    List<BookingResponse> getAllBookings();

    BookingResponse updateBooking(Long bookingId, Long userId, BookingUpdateRequest request);

    BookingResponse approveBooking(Long bookingId, BookingApprovalRequest request);

    BookingResponse rejectBooking(Long bookingId, BookingRejectionRequest request);

    BookingResponse cancelBooking(Long bookingId, Long userId, BookingCancelRequest request);
}