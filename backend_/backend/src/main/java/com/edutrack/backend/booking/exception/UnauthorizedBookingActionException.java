package com.edutrack.backend.booking.exception;

public class UnauthorizedBookingActionException extends RuntimeException {

    public UnauthorizedBookingActionException(String message) {
        super(message);
    }
}
