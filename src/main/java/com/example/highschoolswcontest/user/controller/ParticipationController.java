package com.example.highschoolswcontest.user.controller;

import com.example.highschoolswcontest.entity.ApplicationAttachment;
import com.example.highschoolswcontest.user.service.ParticipationService;
import jakarta.servlet.http.HttpSession;
import java.util.Map;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartHttpServletRequest;

@RestController
@RequestMapping("/api/contests/{contestId}")
public class ParticipationController {
  private final ParticipationService service;

  public ParticipationController(ParticipationService service) {
    this.service = service;
  }

  @PostMapping("/questions")
  public Map<String, Object> ask(
      @PathVariable Long contestId, @RequestBody Map<String, Object> body, HttpSession session) {
    return service.ask(contestId, body, session);
  }

  @PostMapping(value = "/applications", consumes = MediaType.APPLICATION_JSON_VALUE)
  public Map<String, Object> apply(
      @PathVariable Long contestId, @RequestBody Map<String, Object> body, HttpSession session) {
    return service.apply(contestId, body, session);
  }

  @PostMapping(value = "/applications", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public Map<String, Object> applyWithFiles(
      @PathVariable Long contestId,
      @RequestPart("answers") Map<String, Object> body,
      MultipartHttpServletRequest request,
      HttpSession session) {
    return service.applyWithFiles(contestId, body, request.getFileMap(), session);
  }

  @GetMapping("/applications/me")
  public Map<String, Object> myApplication(@PathVariable Long contestId, HttpSession session) {
    return service.myApplication(contestId, session);
  }

  @GetMapping("/applications/me/attachments/{attachmentId}")
  public ResponseEntity<byte[]> myAttachment(
      @PathVariable Long contestId, @PathVariable Long attachmentId, HttpSession session) {
    ApplicationAttachment attachment = service.myAttachment(contestId, attachmentId, session);
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
                .filename(attachment.getOriginalFileName(), java.nio.charset.StandardCharsets.UTF_8)
                .build()
                .toString())
        .body(attachment.getData());
  }
}
