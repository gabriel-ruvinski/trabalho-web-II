package br.ufpr.tads.dto;

import br.ufpr.tads.solicitacao.HistoricoSolicitacao;
import br.ufpr.tads.solicitacao.Solicitacao;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record SolicitacaoResponseDTO(
    Long id,
    Integer clienteId,
    Integer categoriaId,
    String categoriaNome,
    Integer estadoId,
    String descricaoEquipamento,
    String descricaoDefeito,
    LocalDateTime dataHoraAbertura,
    BigDecimal valorOrcado,
    Integer funcionarioOrcamentoId,
    LocalDateTime dataHoraOrcamento,
    String motivoRejeicao,
    Integer funcionarioDestinoId,
    String descricaoManutencao,
    String orientacoesCliente,
    Integer funcionarioManutencaoId,
    LocalDateTime dataHoraManutencao,
    LocalDateTime dataHoraPagamento,
    Integer funcionarioFinalizacaoId,
    LocalDateTime dataHoraFinalizacao,
    List<HistoricoDTO> historico) {

    public record HistoricoDTO(
        Integer estadoAnteriorId,
        Integer estadoNovoId,
        LocalDateTime dataHora,
        Integer usuarioId,
        Integer funcionarioDestinoId,
        String observacao) {

        private static HistoricoDTO de(HistoricoSolicitacao h) {
            return new HistoricoDTO(
                h.getEstadoAnteriorId(),
                h.getEstadoNovoId(),
                h.getDataHora(),
                h.getUsuarioId(),
                h.getFuncionarioDestinoId(),
                h.getObservacao());
        }
    }

    /** Exige categoria e histórico já carregados (JOIN FETCH), pois open-in-view está desativado. */
    public static SolicitacaoResponseDTO de(Solicitacao s) {
        return new SolicitacaoResponseDTO(
            s.getId(),
            s.getClienteId(),
            s.getCategoria().getId(),
            s.getCategoria().getNome(),
            s.getEstadoId(),
            s.getDescricaoEquipamento(),
            s.getDescricaoDefeito(),
            s.getDataHoraAbertura(),
            s.getValorOrcado(),
            s.getFuncionarioOrcamentoId(),
            s.getDataHoraOrcamento(),
            s.getMotivoRejeicao(),
            s.getFuncionarioDestinoId(),
            s.getDescricaoManutencao(),
            s.getOrientacoesCliente(),
            s.getFuncionarioManutencaoId(),
            s.getDataHoraManutencao(),
            s.getDataHoraPagamento(),
            s.getFuncionarioFinalizacaoId(),
            s.getDataHoraFinalizacao(),
            s.getHistorico().stream().map(HistoricoDTO::de).toList());
    }
}