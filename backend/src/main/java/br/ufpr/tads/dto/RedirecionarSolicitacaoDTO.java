package br.ufpr.tads.dto;

import jakarta.validation.constraints.NotNull;

public class RedirecionarSolicitacaoDTO {

    @NotNull(message = "funcionarioAtualId é obrigatório")
    private Integer funcionarioAtualId;

    @NotNull(message = "funcionarioDestinoId é obrigatório")
    private Integer funcionarioDestinoId;

    public Integer getFuncionarioAtualId() {
        return funcionarioAtualId;
    }

    public void setFuncionarioAtualId(Integer funcionarioAtualId) {
        this.funcionarioAtualId = funcionarioAtualId;
    }

    public Integer getFuncionarioDestinoId() {
        return funcionarioDestinoId;
    }

    public void setFuncionarioDestinoId(Integer funcionarioDestinoId) {
        this.funcionarioDestinoId = funcionarioDestinoId;
    }
}