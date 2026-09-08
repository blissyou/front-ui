package com.example.highschoolswcontest.auth.service;

import com.example.highschoolswcontest.entity.User;
import com.example.highschoolswcontest.global.*;
import com.example.highschoolswcontest.repository.UserRepository;
import jakarta.servlet.http.HttpSession;

import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository users;

    public AuthService(UserRepository users) {
        this.users = users;
    }

    public Map<String, Object> signup(Map<String, Object> body) {
        String email = normalizedEmail(body);
        if (users.existsByEmail(email))
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        User user = new User();
        user.setPasswordHash(PasswordHasher.hash(need(body, "password")));
        user.setEmail(email);
        users.save(user);
        return profile(user);
    }

    public Map<String, Object> login(Map<String, Object> body, HttpSession session) {
        User user = users.findByEmail(normalizedEmail(body)).orElseThrow(ApiSupport.Forbidden::new);
        if (!PasswordHasher.matches(need(body, "password"), user.getPasswordHash()))
            throw new ApiSupport.Forbidden();
        session.setAttribute("USER_ID", user.getId());
        session.setAttribute("ROLE", user.getRole());
        return profile(user);
    }

    public void logout(HttpSession session) {
        session.invalidate();
    }

    public User user(HttpSession session) {
        Object id = session == null ? null : session.getAttribute("USER_ID");
        if (!(id instanceof Long)) throw new ApiSupport.Forbidden();
        return users.findById((Long) id).orElseThrow(ApiSupport.Forbidden::new);
    }

    public Map<String, Object> me(HttpSession session) {
        return profile(user(session));
    }

    public Map<String, Object> updateProfile(Map<String, Object> body, HttpSession session) {
        User currentUser = user(session);
        String email = normalizedEmail(body);
        if (!email.equals(currentUser.getEmail()) && users.existsByEmail(email)) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        currentUser.setEmail(email);

        String newPassword = ApiSupport.text(body, "newPassword");
        if (newPassword != null && !newPassword.isBlank()) {
            currentUser.setPasswordHash(PasswordHasher.hash(newPassword));
        }

        return profile(users.save(currentUser));
    }

    private String need(Map<String, Object> body, String key) {
        String value = ApiSupport.text(body, key);
        if (value == null || value.isBlank()) throw new IllegalArgumentException(key + "은(는) 필수입니다.");
        return value.trim();
    }

    private String normalizedEmail(Map<String, Object> body) {
        String email = need(body, "email").toLowerCase();
        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new IllegalArgumentException("올바른 이메일을 입력해 주세요.");
        }
        return email;
    }

    private Map<String, Object> profile(User u) {
        return Map.of("id", u.getId(), "email", u.getEmail(), "role", u.getRole());
    }
}
