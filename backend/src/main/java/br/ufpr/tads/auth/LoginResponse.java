package br.ufpr.tads.auth;

public record LoginResponse(
        Integer id,
        String nome,
        String email,
        String perfil
) {}