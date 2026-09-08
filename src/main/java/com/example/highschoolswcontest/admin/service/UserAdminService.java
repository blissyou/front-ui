package com.example.highschoolswcontest.admin.service;

import com.example.highschoolswcontest.entity.User;
import com.example.highschoolswcontest.global.ApiSupport;
import com.example.highschoolswcontest.repository.UserRepository;
import jakarta.servlet.http.HttpSession;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class UserAdminService {
    private final UserRepository users;

    public UserAdminService(UserRepository users) {
        this.users = users;
    }

    public List<Map<String, Object>> users(HttpSession session) {
        ApiSupport.admin(session);
        return users.findAll().stream().map(this::view).toList();
    }

    public Map<String, Object> changeRole(
            Long userId, Map<String, Object> body, HttpSession session) {
        ApiSupport.admin(session);
        Long currentUserId = (Long) session.getAttribute("USER_ID");
        if (userId.equals(currentUserId)) {
            throw new IllegalArgumentException("현재 로그인한 운영자의 권한은 변경할 수 없습니다.");
        }

        String role = ApiSupport.text(body, "role");
        if (!"USER".equals(role) && !"ADMIN".equals(role)) {
            throw new IllegalArgumentException("유효하지 않은 권한입니다.");
        }

        User user = users.findById(userId).orElseThrow(() -> new ApiSupport.Missing("사용자를 찾을 수 없습니다."));
        user.setRole(role);
        return view(users.save(user));
    }

    private Map<String, Object> view(User user) {
        return Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "createdAt", user.getCreatedAt());
    }
}
