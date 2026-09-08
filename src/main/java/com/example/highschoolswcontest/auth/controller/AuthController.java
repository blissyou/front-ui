package com.example.highschoolswcontest.auth.controller;

import com.example.highschoolswcontest.auth.service.AuthService;
import jakarta.servlet.http.HttpSession;

import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/signup")
    public Map<String, Object> signup(@RequestBody Map<String, Object> body) {
        return auth.signup(body);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, Object> body, HttpSession session) {
        return auth.login(body, session);
    }

    @PostMapping("/logout")
    public Map<String, Boolean> logout(HttpSession session) {
        auth.logout(session);
        return Map.of("success", true);
    }

    @GetMapping("/me")
    public Map<String, Object> me(HttpSession session) {
        return auth.me(session);
    }

    @PatchMapping("/me")
    public Map<String, Object> updateProfile(
            @RequestBody Map<String, Object> body, HttpSession session) {
        return auth.updateProfile(body, session);
    }
}
