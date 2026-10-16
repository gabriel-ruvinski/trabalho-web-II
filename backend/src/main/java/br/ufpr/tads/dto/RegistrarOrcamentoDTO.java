package br.ufpr.tads.solicitacao.dto;

import java.math.BigDecimal;

public class RegistrarOrcamentoDTO {

    private BigDecimal valor;
    private Integer funcionarioId;

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public Integer getFuncionarioId() {
        return funcionarioId;
    }

    public void setFuncionarioId(Integer funcionarioId) {
        this.funcionarioId = funcionarioId;
    }
}