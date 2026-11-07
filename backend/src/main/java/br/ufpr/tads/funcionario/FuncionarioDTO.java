package br.ufpr.tads.funcionario;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record FuncionarioDTO(

        @NotBlank
        @Size(max = 150)
        String nome,

        @NotBlank
        @Email
        @Size(max = 150)
        String email,

        @NotNull
        @Past(message = "Data de nascimento deve estar no passado")
        LocalDate dataNascimento,

        @NotBlank(message = "Informe a senha")
        @Pattern(
                regexp = "\\d{4}",
                message = "A senha deve ter exatamente 4 dígitos numéricos"
        )
        String senha
) {}