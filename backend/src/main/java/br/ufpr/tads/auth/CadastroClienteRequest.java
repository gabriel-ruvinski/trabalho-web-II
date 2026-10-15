package br.ufpr.tads.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CadastroClienteRequest(

        @NotBlank
        @Size(max = 150)
        String nome,

        @NotBlank
        @Email
        @Size(max = 150)
        String email,

        @NotBlank
        @Pattern(regexp = "\\d{11}", message = "CPF deve conter 11 dígitos")
        String cpf,

        @NotBlank
        @Pattern(
                regexp = "\\d{10,11}",
                message = "Telefone deve conter 10 ou 11 dígitos"
        )
        String telefone,

        @NotBlank
        @Pattern(regexp = "\\d{8}", message = "CEP deve conter 8 dígitos")
        String cep,

        @NotBlank
        @Size(max = 150)
        String logradouro,

        @NotBlank
        @Size(max = 10)
        String numero,

        @Size(max = 100)
        String complemento,

        @NotBlank
        @Size(max = 100)
        String bairro,

        @NotBlank
        @Size(max = 100)
        String cidade,

        @NotBlank
        @Pattern(regexp = "[A-Za-z]{2}", message = "UF deve ter duas letras")
        String uf
) {}