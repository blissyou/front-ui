package com.example.highschoolswcontest.open.controller;

import com.example.highschoolswcontest.entity.*;
import com.example.highschoolswcontest.open.service.ContestPublicService;
import jakarta.servlet.http.HttpSession;

import java.nio.charset.StandardCharsets;
import java.util.*;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/contests")
public class ContestPublicController {
    private final ContestPublicService service;

    public ContestPublicController(ContestPublicService service) {
        this.service = service;
    }

    @GetMapping
    public List<Contest> contests() {
        return service.contests();
    }

    @GetMapping("/{contestId}")
    public Contest contest(@PathVariable Long contestId) {
        return service.contest(contestId);
    }

    @GetMapping("/{contestId}/application-form")
    public List<Map<String, Object>> applicationForm(@PathVariable Long contestId) {
        return service.applicationForm(contestId);
    }

    @GetMapping("/{contestId}/notices")
    public List<Map<String, Object>> notices(@PathVariable Long contestId) {
        return service.notices(contestId);
    }

    @GetMapping("/{contestId}/notices/{noticeId}")
    public Map<String, Object> notice(@PathVariable Long contestId, @PathVariable Long noticeId) {
        return service.notice(contestId, noticeId);
    }

    @GetMapping("/{contestId}/notices/{noticeId}/attachments/{attachmentId}")
    public ResponseEntity<byte[]> noticeAttachment(
            @PathVariable Long contestId, @PathVariable Long noticeId, @PathVariable Long attachmentId) {
        NoticeAttachment attachment = service.noticeAttachment(contestId, noticeId, attachmentId);
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (attachment.getContentType() != null) {
            try {
                mediaType = MediaType.parseMediaType(attachment.getContentType());
            } catch (InvalidMediaTypeException ignored) {
            }
        }
        return ResponseEntity.ok()
                .contentType(mediaType)
                .contentLength(attachment.getFileSize())
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(attachment.getOriginalFileName(), StandardCharsets.UTF_8)
                                .build()
                                .toString())
                .body(attachment.getData());
    }

    @GetMapping("/{contestId}/questions")
    public List<Map<String, Object>> questions(@PathVariable Long contestId, HttpSession session) {
        return service.questions(contestId, session);
    }

    @GetMapping("/{contestId}/questions/{questionId}")
    public Map<String, Object> question(
            @PathVariable Long contestId, @PathVariable Long questionId, HttpSession session) {
        return service.question(contestId, questionId, session);
    }
}
