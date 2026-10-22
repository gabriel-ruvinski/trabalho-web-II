package br.ufpr.tads.exception;

import java.time.Instant;
import java.util.List;

public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        List<CampoErro> campos
) {
    public record CampoErro(String campo, String mensagem) {}
}