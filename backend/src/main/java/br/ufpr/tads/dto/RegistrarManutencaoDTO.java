package br.ufpr.tads.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RegistrarManutencaoDTO {

    @NotNull(message = "funcionarioId é obrigatório")
    private Integer funcionarioId;

    @NotBlank(message = "Descrição é obrigatória")
    @Size(max = 500)
    private String descricao;

    @Size(max = 500)
    private String orientacoes;

    public Integer getFuncionarioId() {
        return funcionarioId;
    }

    public void setFuncionarioId(Integer funcionarioId) {
        this.funcionarioId = funcionarioId;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getOrientacoes() {
        return orientacoes;
    }

    public void setOrientacoes(String orientacoes) {
        this.orientacoes = orientacoes;
    }
}