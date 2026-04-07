package com.edutrack.backend.booking.repository;

import com.edutrack.backend.booking.entity.Booking;
import com.edutrack.backend.booking.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByResourceIdAndBookingDate(Long resourceId, LocalDate bookingDate);

    List<Booking> findByResourceIdAndBookingDateAndStatusIn(
            Long resourceId,
            LocalDate bookingDate,
            List<BookingStatus> statuses
    );

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);
}