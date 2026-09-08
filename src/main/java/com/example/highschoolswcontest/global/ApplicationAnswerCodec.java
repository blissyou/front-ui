package com.example.highschoolswcontest.global;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

public final class ApplicationAnswerCodec {
    private ApplicationAnswerCodec() {
    }

    public static String encode(Map<String, String> answers) {
        return answers.entrySet().stream()
                .map(
                        answer ->
                                answer.getKey()
                                        + ":"
                                        + Base64.getUrlEncoder()
                                        .encodeToString(answer.getValue().getBytes(StandardCharsets.UTF_8)))
                .reduce((left, right) -> left + ";" + right)
                .orElse("");
    }

    public static Map<String, String> decode(String encodedAnswers) {
        Map<String, String> answers = new LinkedHashMap<>();
        if (encodedAnswers == null || encodedAnswers.isBlank()) {
            return answers;
        }
        for (String entry : encodedAnswers.split(";")) {
            String[] parts = entry.split(":", 2);
            if (parts.length == 2) {
                answers.put(
                        parts[0], new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8));
            }
        }
        return answers;
    }
}
