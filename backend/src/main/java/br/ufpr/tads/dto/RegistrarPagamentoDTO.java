package br.ufpr.tads.dto;

import jakarta.validation.constraints.NotNull;

public class RegistrarPagamentoDTO {

    @NotNull(message = "usuarioId é obrigatório")
    private Integer usuarioId;

    public Integer getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Integer usuarioId) {
        this.usuarioId = usuarioId;
    }
}