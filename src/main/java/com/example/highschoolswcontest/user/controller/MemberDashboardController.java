package com.example.highschoolswcontest.user.controller;

import com.example.highschoolswcontest.user.service.MemberDashboardService;
import jakarta.servlet.http.HttpSession;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/member")
public class MemberDashboardController {
  private final MemberDashboardService service;

  public MemberDashboardController(MemberDashboardService service) {
    this.service = service;
  }

  @GetMapping("/dashboard")
  public Map<String, Object> dashboard(HttpSession session) {
    return service.dashboard(session);
  }
}
