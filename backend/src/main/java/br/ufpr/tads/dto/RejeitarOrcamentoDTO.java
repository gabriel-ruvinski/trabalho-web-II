package br.ufpr.tads.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RejeitarOrcamentoDTO {

    @NotNull(message = "usuarioId é obrigatório")
    private Integer usuarioId;

    @NotBlank(message = "Motivo é obrigatório")
    @Size(max = 500)
    private String motivo;

    public Integer getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Integer usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }
}