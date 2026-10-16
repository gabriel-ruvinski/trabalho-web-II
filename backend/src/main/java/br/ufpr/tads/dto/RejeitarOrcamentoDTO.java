package br.ufpr.tads.solicitacao.dto;

public class RejeitarOrcamentoDTO {

    private Integer usuarioId;
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