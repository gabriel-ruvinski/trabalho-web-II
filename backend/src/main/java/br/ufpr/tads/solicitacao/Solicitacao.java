package br.ufpr.tads.solicitacao;

import br.ufpr.tads.categoria.Categoria;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "solicitacao")
public class Solicitacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cliente_id", nullable = false)
    private Integer clienteId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(name = "estado_id", nullable = false)
    private Integer estadoId;

    @Column(nullable = false, length = 255)
    private String descricaoEquipamento;

    @Column(nullable = false, columnDefinition = "text")
    private String descricaoDefeito;

    @Column(nullable = false)
    private LocalDateTime dataHoraAbertura;

    @Column(precision = 10, scale = 2)
    private BigDecimal valorOrcado;

    private Integer funcionarioOrcamentoId;

    private LocalDateTime dataHoraOrcamento;

    @Column(columnDefinition = "text")
    private String motivoRejeicao;

    private Integer funcionarioDestinoId;

    @Column(columnDefinition = "text")
    private String descricaoManutencao;

    @Column(columnDefinition = "text")
    private String orientacoesCliente;

    private Integer funcionarioManutencaoId;

    private LocalDateTime dataHoraManutencao;

    private LocalDateTime dataHoraPagamento;

    private Integer funcionarioFinalizacaoId;

    private LocalDateTime dataHoraFinalizacao;

    @OneToMany(mappedBy = "solicitacao", cascade = CascadeType.ALL)
    @OrderBy("dataHora ASC")
    private List<HistoricoSolicitacao> historico = new ArrayList<>();

    public Solicitacao() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getClienteId() { return clienteId; }
    public void setClienteId(Integer clienteId) { this.clienteId = clienteId; }

    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }

    public Integer getEstadoId() { return estadoId; }
    public void setEstadoId(Integer estadoId) { this.estadoId = estadoId; }

    public String getDescricaoEquipamento() { return descricaoEquipamento; }
    public void setDescricaoEquipamento(String descricaoEquipamento) { this.descricaoEquipamento = descricaoEquipamento; }

    public String getDescricaoDefeito() { return descricaoDefeito; }
    public void setDescricaoDefeito(String descricaoDefeito) { this.descricaoDefeito = descricaoDefeito; }

    public LocalDateTime getDataHoraAbertura() { return dataHoraAbertura; }
    public void setDataHoraAbertura(LocalDateTime dataHoraAbertura) { this.dataHoraAbertura = dataHoraAbertura; }

    public BigDecimal getValorOrcado() { return valorOrcado; }
    public void setValorOrcado(BigDecimal valorOrcado) { this.valorOrcado = valorOrcado; }

    public Integer getFuncionarioOrcamentoId() { return funcionarioOrcamentoId; }
    public void setFuncionarioOrcamentoId(Integer funcionarioOrcamentoId) { this.funcionarioOrcamentoId = funcionarioOrcamentoId; }

    public LocalDateTime getDataHoraOrcamento() { return dataHoraOrcamento; }
    public void setDataHoraOrcamento(LocalDateTime dataHoraOrcamento) { this.dataHoraOrcamento = dataHoraOrcamento; }

    public String getMotivoRejeicao() { return motivoRejeicao; }
    public void setMotivoRejeicao(String motivoRejeicao) { this.motivoRejeicao = motivoRejeicao; }

    public Integer getFuncionarioDestinoId() { return funcionarioDestinoId; }
    public void setFuncionarioDestinoId(Integer funcionarioDestinoId) { this.funcionarioDestinoId = funcionarioDestinoId; }

    public String getDescricaoManutencao() { return descricaoManutencao; }
    public void setDescricaoManutencao(String descricaoManutencao) { this.descricaoManutencao = descricaoManutencao; }

    public String getOrientacoesCliente() { return orientacoesCliente; }
    public void setOrientacoesCliente(String orientacoesCliente) { this.orientacoesCliente = orientacoesCliente; }

    public Integer getFuncionarioManutencaoId() { return funcionarioManutencaoId; }
    public void setFuncionarioManutencaoId(Integer funcionarioManutencaoId) { this.funcionarioManutencaoId = funcionarioManutencaoId; }

    public LocalDateTime getDataHoraManutencao() { return dataHoraManutencao; }
    public void setDataHoraManutencao(LocalDateTime dataHoraManutencao) { this.dataHoraManutencao = dataHoraManutencao; }

    public LocalDateTime getDataHoraPagamento() { return dataHoraPagamento; }
    public void setDataHoraPagamento(LocalDateTime dataHoraPagamento) { this.dataHoraPagamento = dataHoraPagamento; }

    public Integer getFuncionarioFinalizacaoId() { return funcionarioFinalizacaoId; }
    public void setFuncionarioFinalizacaoId(Integer funcionarioFinalizacaoId) { this.funcionarioFinalizacaoId = funcionarioFinalizacaoId; }

    public LocalDateTime getDataHoraFinalizacao() { return dataHoraFinalizacao; }
    public void setDataHoraFinalizacao(LocalDateTime dataHoraFinalizacao) { this.dataHoraFinalizacao = dataHoraFinalizacao; }

    public List<HistoricoSolicitacao> getHistorico() { return historico; }
}