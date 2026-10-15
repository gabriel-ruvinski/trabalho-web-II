package br.ufpr.tads.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;

import org.springframework.stereotype.Service;

@Service
public class PasswordService {

    private final SecureRandom random = new SecureRandom();

    public String gerarSenhaTemporaria() {
        return String.format("%04d", random.nextInt(10_000));
    }

    public String gerarSalt() {
        byte[] bytes = new byte[16];
        random.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    public String gerarHash(String senha, String salt) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] entrada = (salt + ":" + senha)
                    .getBytes(StandardCharsets.UTF_8);

            byte[] hash = digest.digest(entrada);

            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(
                    "SHA-256 não está disponível neste ambiente.", e
            );
        }
    }

    public boolean verificarSenha(
            String senhaInformada,
            String saltArmazenado,
            String hashArmazenado
    ) {
        String hashCalculado = gerarHash(senhaInformada, saltArmazenado);

        return MessageDigest.isEqual(
                HexFormat.of().parseHex(hashCalculado),
                HexFormat.of().parseHex(hashArmazenado)
        );
    }
}