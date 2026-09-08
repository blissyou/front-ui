package com.example.highschoolswcontest.admin.controller;

import com.example.highschoolswcontest.admin.service.UserAdminService;
import jakarta.servlet.http.HttpSession;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
public class UserAdminController {
    private final UserAdminService service;

    public UserAdminController(UserAdminService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> users(HttpSession session) {
        return service.users(session);
    }

    @PatchMapping("/{userId}/role")
    public Map<String, Object> changeRole(
            @PathVariable Long userId, @RequestBody Map<String, Object> body, HttpSession session) {
        return service.changeRole(userId, body, session);
    }
}
