package br.ufpr.tads.dto;

import br.ufpr.tads.solicitacao.HistoricoSolicitacao;
import br.ufpr.tads.solicitacao.Solicitacao;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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
    List<HistoricoDTO> historico,
    Integer funcionarioResponsavelId,
    String funcionarioResponsavelNome) {

    public record HistoricoDTO(
        Integer estadoAnteriorId,
        Integer estadoNovoId,
        LocalDateTime dataHora,
        Integer usuarioId,
        Integer funcionarioDestinoId,
        String observacao,
        String funcionarioNome) {

        private static HistoricoDTO de(HistoricoSolicitacao h, Map<Integer, String> nomes) {
            return new HistoricoDTO(
                h.getEstadoAnteriorId(),
                h.getEstadoNovoId(),
                h.getDataHora(),
                h.getUsuarioId(),
                h.getFuncionarioDestinoId(),
                h.getObservacao(),
                nome(nomes, h.getUsuarioId()));
        }
    }

    public static SolicitacaoResponseDTO de(Solicitacao s) {
        return de(s, null, Map.of());
    }

    public static SolicitacaoResponseDTO de(
            Solicitacao s, Integer responsavelId, Map<Integer, String> nomes) {
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
            s.getHistorico().stream().map(h -> HistoricoDTO.de(h, nomes)).toList(),
            responsavelId,
            nome(nomes, responsavelId));
    }

    private static String nome(Map<Integer, String> nomes, Integer id) {
        return id == null ? null : nomes.get(id);
    }
}