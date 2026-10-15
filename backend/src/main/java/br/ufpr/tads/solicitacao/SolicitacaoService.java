package br.ufpr.tads.solicitacao;

import br.ufpr.tads.categoria.Categoria;
import br.ufpr.tads.categoria.CategoriaRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.ResponseStatus;

@Service
public class SolicitacaoService {

    @ResponseStatus(HttpStatus.CONFLICT)
    public static class TransicaoInvalidaException extends RuntimeException {

        public TransicaoInvalidaException(String mensagem) {
            super(mensagem);
        }
    }

    private static final int ABERTA = 1;
    private static final int ORCADA = 2;
    private static final int REJEITADA = 3;
    private static final int APROVADA = 4;
    private static final int REDIRECIONADA = 5;
    private static final int ARRUMADA = 6;
    private static final int PAGA = 7;
    private static final int FINALIZADA = 8;

    private final SolicitacaoRepository repository;
    private final CategoriaRepository categoriaRepository;

    public SolicitacaoService(SolicitacaoRepository repository, CategoriaRepository categoriaRepository) {
        this.repository = repository;
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional
    public Solicitacao criar(Integer clienteId, Integer categoriaId, String descricaoEquipamento, String descricaoDefeito) {
        exigirId(clienteId, "O cliente é obrigatório");
        exigirId(categoriaId, "A categoria é obrigatória");
        exigirTexto(descricaoEquipamento, "A descrição do equipamento é obrigatória");
        exigirTexto(descricaoDefeito, "A descrição do defeito é obrigatória");

        Categoria categoria = categoriaRepository.findById(categoriaId)
            .filter(Categoria::isAtivo)
            .orElseThrow(() -> new IllegalArgumentException("Categoria inválida"));

        LocalDateTime agora = LocalDateTime.now();
        Solicitacao solicitacao = new Solicitacao();
        solicitacao.setClienteId(clienteId);
        solicitacao.setCategoria(categoria);
        solicitacao.setDescricaoEquipamento(descricaoEquipamento.trim());
        solicitacao.setDescricaoDefeito(descricaoDefeito.trim());
        solicitacao.setDataHoraAbertura(agora);
        registrar(solicitacao, ABERTA, clienteId, null, "Solicitação aberta", agora);
        return repository.save(solicitacao);
    }

    @Transactional
    public Solicitacao orcar(Long id, Integer funcionarioId, BigDecimal valor) {
        Solicitacao solicitacao = buscar(id);
        exigirEstado(solicitacao, ABERTA);
        if (valor == null || valor.signum() <= 0) {
            throw new IllegalArgumentException("O valor do orçamento deve ser maior que zero");
        }
        LocalDateTime agora = LocalDateTime.now();
        solicitacao.setValorOrcado(valor);
        solicitacao.setFuncionarioOrcamentoId(funcionarioId);
        solicitacao.setDataHoraOrcamento(agora);
        registrar(solicitacao, ORCADA, funcionarioId, null,
            "Orçamento no valor de R$ " + valor.setScale(2, RoundingMode.HALF_UP).toPlainString(), agora);
        return repository.save(solicitacao);
    }

    @Transactional
    public Solicitacao aprovar(Long id, Integer usuarioId) {
        Solicitacao solicitacao = buscar(id);
        exigirEstado(solicitacao, ORCADA);
        registrar(solicitacao, APROVADA, usuarioId, null, "Serviço aprovado", LocalDateTime.now());
        return repository.save(solicitacao);
    }

    @Transactional
    public Solicitacao rejeitar(Long id, Integer usuarioId, String motivo) {
        Solicitacao solicitacao = buscar(id);
        exigirEstado(solicitacao, ORCADA);
        exigirTexto(motivo, "O motivo da rejeição é obrigatório");
        solicitacao.setMotivoRejeicao(motivo.trim());
        registrar(solicitacao, REJEITADA, usuarioId, null, motivo.trim(), LocalDateTime.now());
        return repository.save(solicitacao);
    }

    @Transactional
    public Solicitacao resgatar(Long id, Integer usuarioId) {
        Solicitacao solicitacao = buscar(id);
        exigirEstado(solicitacao, REJEITADA);
        registrar(solicitacao, APROVADA, usuarioId, null, "Serviço resgatado", LocalDateTime.now());
        return repository.save(solicitacao);
    }

    @Transactional
    public Solicitacao efetuarManutencao(Long id, Integer funcionarioId, String descricao, String orientacoes) {
        Solicitacao solicitacao = buscar(id);
        exigirEstado(solicitacao, APROVADA, REDIRECIONADA);
        exigirTexto(descricao, "A descrição da manutenção é obrigatória");
        exigirTexto(orientacoes, "As orientações ao cliente são obrigatórias");
        LocalDateTime agora = LocalDateTime.now();
        solicitacao.setDescricaoManutencao(descricao.trim());
        solicitacao.setOrientacoesCliente(orientacoes.trim());
        solicitacao.setFuncionarioManutencaoId(funcionarioId);
        solicitacao.setDataHoraManutencao(agora);
        registrar(solicitacao, ARRUMADA, funcionarioId, null, descricao.trim(), agora);
        return repository.save(solicitacao);
    }

    @Transactional
    public Solicitacao redirecionar(Long id, Integer funcionarioOrigemId, Integer funcionarioDestinoId) {
        Solicitacao solicitacao = buscar(id);
        exigirEstado(solicitacao, APROVADA, REDIRECIONADA);
        exigirId(funcionarioDestinoId, "O funcionário de destino é obrigatório");
        if (funcionarioDestinoId.equals(funcionarioOrigemId)) {
            throw new IllegalArgumentException("Não é possível redirecionar a manutenção para si mesmo");
        }
        solicitacao.setFuncionarioDestinoId(funcionarioDestinoId);
        registrar(solicitacao, REDIRECIONADA, funcionarioOrigemId, funcionarioDestinoId,
            "Redirecionada para o funcionário " + funcionarioDestinoId, LocalDateTime.now());
        return repository.save(solicitacao);
    }

    @Transactional
    public Solicitacao pagar(Long id, Integer usuarioId) {
        Solicitacao solicitacao = buscar(id);
        exigirEstado(solicitacao, ARRUMADA);
        LocalDateTime agora = LocalDateTime.now();
        solicitacao.setDataHoraPagamento(agora);
        registrar(solicitacao, PAGA, usuarioId, null, "Pagamento confirmado", agora);
        return repository.save(solicitacao);
    }

    @Transactional
    public Solicitacao finalizar(Long id, Integer funcionarioId) {
        Solicitacao solicitacao = buscar(id);
        exigirEstado(solicitacao, PAGA);
        LocalDateTime agora = LocalDateTime.now();
        solicitacao.setFuncionarioFinalizacaoId(funcionarioId);
        solicitacao.setDataHoraFinalizacao(agora);
        registrar(solicitacao, FINALIZADA, funcionarioId, null, "Solicitação finalizada", agora);
        return repository.save(solicitacao);
    }

    private Solicitacao buscar(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada: " + id));
    }

    private void exigirEstado(Solicitacao solicitacao, Integer... permitidos) {
        for (Integer permitido : permitidos) {
            if (permitido.equals(solicitacao.getEstadoId())) {
                return;
            }
        }
        throw new TransicaoInvalidaException(
            "Operação não permitida para solicitação no estado " + nomeEstado(solicitacao.getEstadoId()));
    }

    private void registrar(Solicitacao solicitacao, Integer novoEstado, Integer usuarioId,
                           Integer destinoId, String observacao, LocalDateTime agora) {
        exigirId(usuarioId, "O usuário é obrigatório");
        HistoricoSolicitacao registro = new HistoricoSolicitacao();
        registro.setSolicitacao(solicitacao);
        registro.setEstadoAnteriorId(solicitacao.getEstadoId());
        registro.setEstadoNovoId(novoEstado);
        registro.setDataHora(agora);
        registro.setUsuarioId(usuarioId);
        registro.setFuncionarioDestinoId(destinoId);
        registro.setObservacao(observacao);
        solicitacao.setEstadoId(novoEstado);
        solicitacao.getHistorico().add(registro);
    }

    private void exigirId(Integer valor, String mensagem) {
        if (valor == null) {
            throw new IllegalArgumentException(mensagem);
        }
    }

    private void exigirTexto(String valor, String mensagem) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException(mensagem);
        }
    }

    private String nomeEstado(int estadoId) {
        return switch (estadoId) {
            case ABERTA -> "ABERTA";
            case ORCADA -> "ORCADA";
            case REJEITADA -> "REJEITADA";
            case APROVADA -> "APROVADA";
            case REDIRECIONADA -> "REDIRECIONADA";
            case ARRUMADA -> "ARRUMADA";
            case PAGA -> "PAGA";
            case FINALIZADA -> "FINALIZADA";
            default -> "DESCONHECIDO";
        };
    }
}
