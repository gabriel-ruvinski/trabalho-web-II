package br.ufpr.tads.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CategoriaDTO {

    @NotBlank(message = "O nome da categoria é obrigatório")
    @Size(max = 50, message = "O nome deve ter no máximo 50 caracteres")
    private String nome;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }
}
