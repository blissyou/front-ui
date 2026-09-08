package com.example.highschoolswcontest.global;

import jakarta.servlet.http.HttpSession;

import java.time.*;
import java.util.*;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

public final class ApiSupport {
    private ApiSupport() {
    }

    public static void admin(HttpSession s) {
        if (s == null || !"ADMIN".equals(s.getAttribute("ROLE"))) throw new Forbidden();
    }

    public static String text(Map<String, Object> b, String k) {
        Object v = b.get(k);
        return v == null ? null : String.valueOf(v);
    }

    public static Long num(Map<String, Object> b, String k) {
        Object v = b.get(k);
        return v == null ? null : Long.valueOf(String.valueOf(v));
    }

    public static boolean bool(Map<String, Object> b, String k, boolean d) {
        Object v = b.get(k);
        return v == null ? d : Boolean.parseBoolean(String.valueOf(v));
    }

    public static LocalDate date(Map<String, Object> b, String k) {
        String v = text(b, k);
        return v == null || v.isBlank() ? null : LocalDate.parse(v);
    }

    public static LocalDateTime dateTime(Map<String, Object> b, String k) {
        String v = text(b, k);
        return v == null || v.isBlank() ? null : LocalDateTime.parse(v);
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    public static class Forbidden extends RuntimeException {
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    public static class Missing extends RuntimeException {
        public Missing(String s) {
            super(s);
        }
    }
}
