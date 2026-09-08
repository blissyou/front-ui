package com.example.highschoolswcontest.global;

import java.security.*;
import java.util.Base64;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

public final class PasswordHasher {
    private PasswordHasher() {
    }

    public static String hash(String password) {
        byte[] salt = new byte[16];
        new SecureRandom().nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt) + ":" + encoded(password, salt);
    }

    public static boolean matches(String password, String value) {
        String[] parts = value.split(":");
        return parts.length == 2
                && encoded(password, Base64.getDecoder().decode(parts[0])).equals(parts[1]);
    }

    private static String encoded(String password, byte[] salt) {
        try {
            PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, 120000, 256);
            return Base64.getEncoder()
                    .encodeToString(
                            SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
                                    .generateSecret(spec)
                                    .getEncoded());
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("비밀번호를 처리하지 못했습니다.", exception);
        }
    }
}
