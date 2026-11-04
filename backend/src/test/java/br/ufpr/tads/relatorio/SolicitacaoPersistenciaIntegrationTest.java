package br.ufpr.tads.relatorio;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import br.ufpr.tads.ManutencaoApplication;
import br.ufpr.tads.auth.PasswordService;
import br.ufpr.tads.categoria.Categoria;
import br.ufpr.tads.categoria.CategoriaRepository;
import br.ufpr.tads.manutencao.dto.ReceitaCategoriaDTO;
import br.ufpr.tads.manutencao.dto.ReceitaDiariaDTO;
import br.ufpr.tads.manutencao.service.RelatorioService;
import br.ufpr.tads.solicitacao.EstadoSolicitacaoRepository;
import br.ufpr.tads.solicitacao.FluxoSolicitacaoService;
import br.ufpr.tads.solicitacao.Solicitacao;
import br.ufpr.tads.solicitacao.SolicitacaoRepository;
import br.ufpr.tads.solicitacao.SolicitacaoService;
import jakarta.persistence.EntityManager;

@SpringBootTest(classes = ManutencaoApplication.class)
@ActiveProfiles("test")
@Transactional
class SolicitacaoPersistenciaIntegrationTest {

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private EntityManager em;

    @Autowired
    private SolicitacaoRepository solicitacaoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private EstadoSolicitacaoRepository estadoRepository;

    @Autowired
    private SolicitacaoService solicitacaoService;

    @Autowired
    private FluxoSolicitacaoService fluxoService;

    @Autowired
    private RelatorioService relatorioService;

    @Autowired
    private PasswordService passwordService;

    private int contar(String sql) {
        Integer total = jdbc.queryForObject(sql, Integer.class);
        return total == null ? 0 : total;
    }

    @Test
    void massaDeDadosTemClientesFuncionariosCategoriasESolicitacoes() {
        assertThat(contar("select count(*) from cliente")).isGreaterThanOrEqualTo(1);
        assertThat(contar("select count(*) from funcionario")).isGreaterThanOrEqualTo(1);
        assertThat(contar("select count(*) from categoria_equipamento")).isGreaterThanOrEqualTo(5);
        assertThat(contar("select count(*) from solicitacao")).isGreaterThanOrEqualTo(20);
    }

    @Test
    void massaDeDadosCobreTodosOsEstadosDoFluxo() {
        int estadosCadastrados = contar("select count(*) from estado_solicitacao");
        int estadosUsados = contar("select count(distinct estado_id) from solicitacao");

        assertThat(estadosUsados).isEqualTo(estadosCadastrados);
    }

    @Test
    void usuariosDeDemonstracaoAutenticamComSenha1234() {
        List<Map<String, Object>> usuarios = jdbc.queryForList(
                "select salt, senha_hash from usuario where email like '%@demo.local'");

        assertThat(usuarios).isNotEmpty();
        for (Map<String, Object> u : usuarios) {
            assertThat(passwordService.verificarSenha(
                    "1234", (String) u.get("salt"), (String) u.get("senha_hash"))).isTrue();
        }
    }

    @Test
    void todaSolicitacaoTemHistoricoEncadeadoTerminandoNoEstadoAtual() {
        List<Map<String, Object>> linhas = jdbc.queryForList("""
                select h.solicitacao_id, h.estado_anterior_id, h.estado_novo_id, h.data_hora
                from historico_solicitacao h
                order by h.solicitacao_id, h.data_hora, h.id
                """);

        Map<Long, List<Map<String, Object>>> porSolicitacao = new LinkedHashMap<>();
        for (Map<String, Object> l : linhas) {
            long id = ((Number) l.get("solicitacao_id")).longValue();
            porSolicitacao.computeIfAbsent(id, k -> new ArrayList<>()).add(l);
        }

        assertThat(porSolicitacao).hasSize(contar("select count(*) from solicitacao"));

        Map<Long, Integer> estadoAtual = new LinkedHashMap<>();
        for (Map<String, Object> l : jdbc.queryForList("select id, estado_id from solicitacao")) {
            estadoAtual.put(((Number) l.get("id")).longValue(), ((Number) l.get("estado_id")).intValue());
        }

        porSolicitacao.forEach((id, passos) -> {
            assertThat(passos.get(0).get("estado_anterior_id"))
                    .as("solicitacao %d: o primeiro registro nao tem estado anterior", id).isNull();

            for (int i = 1; i < passos.size(); i++) {
                assertThat(passos.get(i).get("estado_anterior_id"))
                        .as("solicitacao %d, registro %d: encadeamento", id, i)
                        .isEqualTo(passos.get(i - 1).get("estado_novo_id"));

                LocalDateTime atual = ((Timestamp) passos.get(i).get("data_hora")).toLocalDateTime();
                LocalDateTime anterior = ((Timestamp) passos.get(i - 1).get("data_hora")).toLocalDateTime();
                assertThat(atual).as("solicitacao %d, registro %d: ordem cronologica", id, i).isAfter(anterior);
            }

            Number ultimo = (Number) passos.get(passos.size() - 1).get("estado_novo_id");
            assertThat(ultimo.intValue())
                    .as("solicitacao %d: o ultimo estado do historico e o estado atual", id)
                    .isEqualTo(estadoAtual.get(id));
        });
    }

    @Test
    void pagamentoSoExisteEmSolicitacoesPagasOuFinalizadas() {
        int inconsistentes = contar("""
                select count(*) from solicitacao s
                join estado_solicitacao e on e.id = s.estado_id
                where (s.data_hora_pagamento is not null) <> (e.codigo in ('PAGA', 'FINALIZADA'))
                """);

        assertThat(inconsistentes).isZero();
    }

    @Test
    void valorOrcadoSoExisteDepoisDoOrcamento() {
        int abertaComValor = contar("""
                select count(*) from solicitacao s
                join estado_solicitacao e on e.id = s.estado_id
                where e.codigo = 'ABERTA' and s.valor_orcado is not null
                """);
        int orcadaOuAdianteSemValor = contar("""
                select count(*) from solicitacao s
                join estado_solicitacao e on e.id = s.estado_id
                where e.codigo <> 'ABERTA' and s.valor_orcado is null
                """);

        assertThat(abertaComValor).isZero();
        assertThat(orcadaOuAdianteSemValor).isZero();
    }

    @Test
    void jpaLeSolicitacaoPagaComCategoriaEHistorico() {
        Integer pagaId = estadoRepository.findByCodigo("PAGA").orElseThrow().getId();

        Solicitacao s = solicitacaoRepository.findAll().stream()
                .filter(x -> pagaId.equals(x.getEstadoId()))
                .findFirst()
                .orElseThrow();

        assertThat(s.getDataHoraPagamento()).isNotNull();
        assertThat(s.getValorOrcado()).isNotNull();
        assertThat(s.getCategoria().getNome()).isNotBlank();
        assertThat(s.getHistorico()).isNotEmpty();
    }

    @Test
    void fluxoCompletoPersisteHistoricoEPassaAContarNaReceitaSoNoPagamento() {
        Integer clienteId = jdbc.queryForObject("select min(usuario_id) from cliente", Integer.class);
        Integer funcionarioId = jdbc.queryForObject("select min(usuario_id) from funcionario", Integer.class);
        Categoria categoria = categoriaRepository.findAll().stream().findFirst().orElseThrow();

        LocalDate hoje = LocalDate.now();
        BigDecimal receitaHojeAntes = receitaDoDia(hoje);
        BigDecimal receitaCategoriaAntes = receitaDaCategoria(categoria.getNome());
        BigDecimal valor = new BigDecimal("1000.00");

        Solicitacao s = solicitacaoService.criar(clienteId, categoria.getId(),
                "Equipamento de teste de integracao", "Nao liga");
        Long id = s.getId();

        fluxoService.registrarOrcamento(id, valor, funcionarioId);
        fluxoService.aprovarOrcamento(id, clienteId);
        fluxoService.registrarManutencao(id, funcionarioId, "Troca da fonte", "Retirar na recepcao");

        // Orcada, aprovada e arrumada, mas ainda nao paga: nao ha receita.
        assertThat(receitaDoDia(hoje)).isEqualByComparingTo(receitaHojeAntes);
        assertThat(receitaDaCategoria(categoria.getNome())).isEqualByComparingTo(receitaCategoriaAntes);

        fluxoService.registrarPagamento(id, clienteId);

        assertThat(receitaDoDia(hoje)).isEqualByComparingTo(receitaHojeAntes.add(valor));
        assertThat(receitaDaCategoria(categoria.getNome())).isEqualByComparingTo(receitaCategoriaAntes.add(valor));

        fluxoService.finalizarSolicitacao(id, funcionarioId);

        // Finalizar nao conta de novo.
        assertThat(receitaDoDia(hoje)).isEqualByComparingTo(receitaHojeAntes.add(valor));

        em.flush();
        List<String> caminho = jdbc.queryForList("""
                select en.codigo from historico_solicitacao h
                join estado_solicitacao en on en.id = h.estado_novo_id
                where h.solicitacao_id = ?
                order by h.data_hora, h.id
                """, String.class, id);

        assertThat(caminho).containsExactly(
                "ABERTA", "ORCADA", "APROVADA", "ARRUMADA", "PAGA", "FINALIZADA");
    }

    private BigDecimal receitaDoDia(LocalDate dia) {
        return relatorioService.receitaPorDia(dia, dia).stream()
                .map(ReceitaDiariaDTO::receitaTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal receitaDaCategoria(String nome) {
        return relatorioService.receitaPorCategoria(null, null).stream()
                .filter(c -> nome.equals(c.categoria()))
                .map(ReceitaCategoriaDTO::receitaTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}