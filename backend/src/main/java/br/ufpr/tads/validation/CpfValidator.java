package br.ufpr.tads.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CpfValidator implements ConstraintValidator<CpfValido, String> {

    @Override
    public boolean isValid(String cpf, ConstraintValidatorContext context) {
        // Nulo, vazio e formato errado ficam por conta de @NotBlank e @Pattern,
        // para o campo não receber duas mensagens de erro ao mesmo tempo.
        if (cpf == null || !cpf.matches("\\d{11}")) {
            return true;
        }

        // 00000000000, 11111111111 etc. passam na conta, mas não são CPFs válidos.
        if (cpf.chars().distinct().count() == 1) {
            return false;
        }

        return calcularDigito(cpf, 9) == cpf.charAt(9) - '0'
                && calcularDigito(cpf, 10) == cpf.charAt(10) - '0';
    }

    private int calcularDigito(String cpf, int quantidade) {
        int soma = 0;

        for (int i = 0; i < quantidade; i++) {
            soma += (cpf.charAt(i) - '0') * (quantidade + 1 - i);
        }

        int resto = (soma * 10) % 11;
        return resto == 10 ? 0 : resto;
    }
}