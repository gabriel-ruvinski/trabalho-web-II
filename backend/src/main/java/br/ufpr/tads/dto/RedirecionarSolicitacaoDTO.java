package br.ufpr.tads.dto;

public class RedirecionarSolicitacaoDTO {

    private Integer funcionarioAtualId;
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