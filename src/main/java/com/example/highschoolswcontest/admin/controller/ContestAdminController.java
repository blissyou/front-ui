package com.example.highschoolswcontest.admin.controller;

import com.example.highschoolswcontest.admin.service.ApplicationFormAdminService;
import com.example.highschoolswcontest.admin.service.ContestAdminService;
import com.example.highschoolswcontest.entity.*;
import jakarta.servlet.http.HttpSession;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartHttpServletRequest;

@RestController
@RequestMapping("/api/admin/contests")
public class ContestAdminController {
  private final ContestAdminService service;
  private final ApplicationFormAdminService applicationFormService;

  public ContestAdminController(
      ContestAdminService service, ApplicationFormAdminService applicationFormService) {
    this.service = service;
    this.applicationFormService = applicationFormService;
  }

  @PostMapping
  public Contest create(@RequestBody Map<String, Object> body, HttpSession session) {
    return service.createContest(body, session);
  }

  @GetMapping
  public List<Contest> contests(HttpSession session) {
    return service.contests(session);
  }

  @PatchMapping("/{contestId}")
  public Contest update(
      @PathVariable Long contestId, @RequestBody Map<String, Object> body, HttpSession session) {
    return service.updateContest(contestId, body, session);
  }

  @PostMapping("/{contestId}/finish")
  public Contest finish(@PathVariable Long contestId, HttpSession session) {
    return service.finishContest(contestId, session);
  }

  @DeleteMapping("/{contestId}")
  public Map<String, Boolean> delete(@PathVariable Long contestId, HttpSession session) {
    service.deleteContest(contestId, session);
    return Map.of("success", true);
  }

  @GetMapping("/applications")
  public List<Map<String, Object>> applications(HttpSession session) {
    return service.applications(session);
  }

  @GetMapping("/{contestId}/application-form")
  public List<Map<String, Object>> applicationForm(
      @PathVariable Long contestId, HttpSession session) {
    return applicationFormService.fields(contestId, session);
  }

  @PostMapping("/{contestId}/application-form/fields")
  public Map<String, Object> createApplicationFormField(
      @PathVariable Long contestId, @RequestBody Map<String, Object> body, HttpSession session) {
    return applicationFormService.create(contestId, body, session);
  }

  @DeleteMapping("/{contestId}/application-form/fields/{fieldId}")
  public Map<String, Boolean> deleteApplicationFormField(
      @PathVariable Long contestId, @PathVariable Long fieldId, HttpSession session) {
    applicationFormService.delete(contestId, fieldId, session);
    return Map.of("success", true);
  }

  @PostMapping(value = "/{contestId}/notices", consumes = MediaType.APPLICATION_JSON_VALUE)
  public Map<String, Object> notice(
      @PathVariable Long contestId, @RequestBody Map<String, Object> body, HttpSession session) {
    return service.createNotice(contestId, body, session);
  }

  @PostMapping(value = "/{contestId}/notices", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public Map<String, Object> noticeWithFiles(
      @PathVariable Long contestId,
      @RequestPart("notice") Map<String, Object> body,
      MultipartHttpServletRequest request,
      HttpSession session) {
    return service.createNoticeWithFiles(contestId, body, request.getFiles("files"), session);
  }

  @GetMapping("/{contestId}/notices/{noticeId}/attachments/{attachmentId}")
  public ResponseEntity<byte[]> noticeAttachment(
      @PathVariable Long contestId,
      @PathVariable Long noticeId,
      @PathVariable Long attachmentId,
      HttpSession session) {
    NoticeAttachment attachment =
        service.noticeAttachment(contestId, noticeId, attachmentId, session);
    return download(
        attachment.getData(),
        attachment.getFileSize(),
        attachment.getContentType(),
        attachment.getOriginalFileName());
  }

  @PostMapping("/{contestId}/questions/{questionId}/answer")
  public Map<String, Object> answer(
      @PathVariable Long contestId,
      @PathVariable Long questionId,
      @RequestBody Map<String, Object> body,
      HttpSession session) {
    return service.answer(contestId, questionId, body, session);
  }

  @PostMapping("/{contestId}/faqs")
  public Map<String, Object> createFaq(
      @PathVariable Long contestId, @RequestBody Map<String, Object> body, HttpSession session) {
    return service.createFaq(contestId, body, session);
  }

  @GetMapping("/{contestId}/questions")
  public List<Map<String, Object>> questions(@PathVariable Long contestId, HttpSession session) {
    return service.questions(contestId, session);
  }

  @PatchMapping("/{contestId}/applications/{applicationId}/status")
  public Map<String, Object> applicationStatus(
      @PathVariable Long contestId,
      @PathVariable Long applicationId,
      @RequestBody Map<String, Object> body,
      HttpSession session) {
    return service.changeApplicationStatus(contestId, applicationId, body, session);
  }

  @GetMapping("/{contestId}/applications/{applicationId}")
  public Map<String, Object> applicationDetail(
      @PathVariable Long contestId, @PathVariable Long applicationId, HttpSession session) {
    return service.application(applicationId, contestId, session);
  }

  @GetMapping("/{contestId}/applications/{applicationId}/attachments/{attachmentId}")
  public ResponseEntity<byte[]> applicationAttachment(
      @PathVariable Long contestId,
      @PathVariable Long applicationId,
      @PathVariable Long attachmentId,
      HttpSession session) {
    ApplicationAttachment attachment =
        service.applicationAttachment(contestId, applicationId, attachmentId, session);
    return download(
        attachment.getData(),
        attachment.getFileSize(),
        attachment.getContentType(),
        attachment.getOriginalFileName());
  }

  private ResponseEntity<byte[]> download(
      byte[] data, long size, String contentType, String fileName) {
    MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
    if (contentType != null) {
      try {
        mediaType = MediaType.parseMediaType(contentType);
      } catch (InvalidMediaTypeException ignored) {
      }
    }
    return ResponseEntity.ok()
        .contentType(mediaType)
        .contentLength(size)
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.attachment()
                .filename(fileName, StandardCharsets.UTF_8)
                .build()
                .toString())
        .body(data);
  }
}
