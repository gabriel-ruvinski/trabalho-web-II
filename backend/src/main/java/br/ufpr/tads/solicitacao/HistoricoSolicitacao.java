package br.ufpr.tads.solicitacao;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historico_solicitacao")
public class HistoricoSolicitacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "solicitacao_id", nullable = false)
    private Solicitacao solicitacao;

    @Column(name = "estado_anterior_id")
    private Integer estadoAnteriorId;

    @Column(name = "estado_novo_id", nullable = false)
    private Integer estadoNovoId;

    @Column(nullable = false)
    private LocalDateTime dataHora;

    @Column(nullable = false)
    private Integer usuarioId;

    private Integer funcionarioDestinoId;

    @Column(columnDefinition = "text")
    private String observacao;

    public HistoricoSolicitacao() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Solicitacao getSolicitacao() { return solicitacao; }
    public void setSolicitacao(Solicitacao solicitacao) { this.solicitacao = solicitacao; }

    public Integer getEstadoAnteriorId() { return estadoAnteriorId; }
    public void setEstadoAnteriorId(Integer estadoAnteriorId) { this.estadoAnteriorId = estadoAnteriorId; }

    public Integer getEstadoNovoId() { return estadoNovoId; }
    public void setEstadoNovoId(Integer estadoNovoId) { this.estadoNovoId = estadoNovoId; }

    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }

    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }

    public Integer getFuncionarioDestinoId() { return funcionarioDestinoId; }
    public void setFuncionarioDestinoId(Integer funcionarioDestinoId) { this.funcionarioDestinoId = funcionarioDestinoId; }

    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}