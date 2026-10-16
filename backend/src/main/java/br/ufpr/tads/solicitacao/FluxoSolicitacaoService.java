
package br.ufpr.tads.solicitacao;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FluxoSolicitacaoService {

    private final SolicitacaoRepository solicitacaoRepository;
    private final HistoricoSolicitacaoRepository historicoRepository;
    private final EstadoSolicitacaoRepository estadoRepository;

    public FluxoSolicitacaoService(
            SolicitacaoRepository solicitacaoRepository,
            HistoricoSolicitacaoRepository historicoRepository,
            EstadoSolicitacaoRepository estadoRepository) {
        this.solicitacaoRepository = solicitacaoRepository;
        this.historicoRepository = historicoRepository;
        this.estadoRepository = estadoRepository;
    }

    private Solicitacao buscarSolicitacao(Long id) {
        return solicitacaoRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Solicitação não encontrada."));
    }

    private EstadoSolicitacao buscarEstado(String codigo) {
        return estadoRepository.findByCodigo(codigo)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Estado não encontrado: " + codigo));
    }

    private void exigirEstado(Solicitacao solicitacao, String codigo) {
        Integer idEsperado = buscarEstado(codigo).getId();

        if (!idEsperado.equals(solicitacao.getEstadoId())) {
            throw new IllegalStateException(
                    "Operação não permitida. Estado esperado: " + codigo);
        }
    }

    /*
     * Centraliza a alteração do estado e o registro do histórico.
     * Os métodos públicos chamam este método dentro de uma transação.
     */
    private void transicionar(
            Solicitacao solicitacao,
            String novoCodigo,
            Integer usuarioId,
            Integer funcionarioDestinoId,
            String observacao) {

        Integer estadoAnteriorId = solicitacao.getEstadoId();
        Integer estadoNovoId = buscarEstado(novoCodigo).getId();
        LocalDateTime agora = LocalDateTime.now();

        solicitacao.setEstadoId(estadoNovoId);
        solicitacaoRepository.save(solicitacao);

        HistoricoSolicitacao historico = new HistoricoSolicitacao();
        historico.setSolicitacao(solicitacao);
        historico.setEstadoAnteriorId(estadoAnteriorId);
        historico.setEstadoNovoId(estadoNovoId);
        historico.setDataHora(agora);
        historico.setUsuarioId(usuarioId);
        historico.setFuncionarioDestinoId(funcionarioDestinoId);
        historico.setObservacao(observacao);

        historicoRepository.save(historico);
    }

    @Transactional
    public void registrarOrcamento(
            Long solicitacaoId,
            BigDecimal valor,
            Integer funcionarioId) {

        if (valor == null || valor.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "O valor do orçamento não pode ser negativo.");
        }

        exigirUsuario(funcionarioId);

        Solicitacao s = buscarSolicitacao(solicitacaoId);
        exigirEstado(s, "ABERTA");

        s.setValorOrcado(valor);
        s.setFuncionarioOrcamentoId(funcionarioId);
        s.setDataHoraOrcamento(LocalDateTime.now());
        s.setMotivoRejeicao(null);

        transicionar(s, "ORCADA", funcionarioId, null,
                "Orçamento registrado: " + valor);
    }

    @Transactional
    public void aprovarOrcamento(
            Long solicitacaoId,
            Integer usuarioId) {

        exigirUsuario(usuarioId);

        Solicitacao s = buscarSolicitacao(solicitacaoId);
        exigirEstado(s, "ORCADA");

        transicionar(s, "APROVADA", usuarioId, null,
                "Orçamento aprovado.");
    }

    @Transactional
    public void rejeitarOrcamento(
            Long solicitacaoId,
            Integer usuarioId,
            String motivo) {

        exigirUsuario(usuarioId);
        exigirTexto(motivo, "O motivo da rejeição é obrigatório.");

        Solicitacao s = buscarSolicitacao(solicitacaoId);
        exigirEstado(s, "ORCADA");

        s.setMotivoRejeicao(motivo.trim());

        transicionar(s, "REJEITADA", usuarioId, null,
                "Orçamento rejeitado: " + motivo.trim());
    }

    @Transactional
    public void resgatarSolicitacao(
            Long solicitacaoId,
            Integer usuarioId) {

        exigirUsuario(usuarioId);

        Solicitacao s = buscarSolicitacao(solicitacaoId);
        exigirEstado(s, "REJEITADA");

        s.setValorOrcado(null);
        s.setFuncionarioOrcamentoId(null);
        s.setDataHoraOrcamento(null);
        s.setMotivoRejeicao(null);

        transicionar(s, "ABERTA", usuarioId, null,
                "Solicitação resgatada para novo orçamento.");
    }

    @Transactional
    public void registrarManutencao(
            Long solicitacaoId,
            Integer funcionarioId,
            String descricao,
            String orientacoes) {

        exigirUsuario(funcionarioId);
        exigirTexto(descricao, "A descrição da manutenção é obrigatória.");
        exigirTexto(orientacoes, "As orientações ao cliente são obrigatórias.");

        Solicitacao s = buscarSolicitacao(solicitacaoId);

        if (!estadoAtualEh(s, "APROVADA")
                && !estadoAtualEh(s, "REDIRECIONADA")) {
            throw new IllegalStateException(
                    "A solicitação precisa estar aprovada ou redirecionada.");
        }

        s.setDescricaoManutencao(descricao.trim());
        s.setOrientacoesCliente(orientacoes.trim());
        s.setFuncionarioManutencaoId(funcionarioId);
        s.setDataHoraManutencao(LocalDateTime.now());

        transicionar(s, "ARRUMADA", funcionarioId, null,
                "Manutenção registrada.");
    }

    @Transactional
    public void redirecionarFuncionario(
            Long solicitacaoId,
            Integer funcionarioAtualId,
            Integer funcionarioDestinoId) {

        exigirUsuario(funcionarioAtualId);
        exigirUsuario(funcionarioDestinoId);

        if (funcionarioAtualId.equals(funcionarioDestinoId)) {
            throw new IllegalArgumentException(
                    "Não é permitido redirecionar para si mesmo.");
        }

        Solicitacao s = buscarSolicitacao(solicitacaoId);

        if (!estadoAtualEh(s, "APROVADA")
                && !estadoAtualEh(s, "REDIRECIONADA")) {
            throw new IllegalStateException(
                    "Só é possível redirecionar uma solicitação aprovada.");
        }

        s.setFuncionarioDestinoId(funcionarioDestinoId);

        transicionar(s, "REDIRECIONADA", funcionarioAtualId,
                funcionarioDestinoId,
                "Solicitação redirecionada para o funcionário "
                        + funcionarioDestinoId + ".");
    }

    @Transactional
    public void registrarPagamento(
            Long solicitacaoId,
            Integer usuarioId) {

        exigirUsuario(usuarioId);

        Solicitacao s = buscarSolicitacao(solicitacaoId);
        exigirEstado(s, "ARRUMADA");

        s.setDataHoraPagamento(LocalDateTime.now());

        transicionar(s, "PAGA", usuarioId, null,
                "Pagamento registrado.");
    }

    @Transactional
    public void finalizarSolicitacao(
            Long solicitacaoId,
            Integer funcionarioId) {

        exigirUsuario(funcionarioId);

        Solicitacao s = buscarSolicitacao(solicitacaoId);
        exigirEstado(s, "PAGA");

        s.setFuncionarioFinalizacaoId(funcionarioId);
        s.setDataHoraFinalizacao(LocalDateTime.now());

        transicionar(s, "FINALIZADA", funcionarioId, null,
                "Solicitação finalizada.");
    }

    private boolean estadoAtualEh(Solicitacao s, String codigo) {
        return buscarEstado(codigo).getId().equals(s.getEstadoId());
    }

    private void exigirUsuario(Integer usuarioId) {
        if (usuarioId == null) {
            throw new IllegalArgumentException(
                    "O identificador do usuário é obrigatório.");
        }
    }

    private void exigirTexto(String texto, String mensagem) {
        if (texto == null || texto.isBlank()) {
            throw new IllegalArgumentException(mensagem);
        }
    }
}
