package br.ufpr.tads.relatorio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.jayway.jsonpath.JsonPath;

import br.ufpr.tads.ManutencaoApplication;

@SpringBootTest(classes = ManutencaoApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class RelatorioReceitaIntegrationTest {

    private static final String POR_DIA = "/api/relatorios/receita-por-dia";
    private static final String POR_CATEGORIA = "/api/relatorios/receita-por-categoria";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbc;

    private record Pagamento(LocalDateTime pagoEm, BigDecimal valor, int categoriaId, String categoria) {
    }

    private record LinhaDia(LocalDate data, BigDecimal total, long quantidade) {
    }

    private record LinhaCategoria(int id, String nome, BigDecimal total, long quantidade) {
    }
    private List<Pagamento> pagamentos() {
        return jdbc.query("""
                select s.data_hora_pagamento, s.valor_orcado, c.id, c.nome
                from solicitacao s
                join categoria_equipamento c on c.id = s.categoria_id
                where s.data_hora_pagamento is not null and s.valor_orcado is not null
                """,
                (rs, i) -> new Pagamento(rs.getTimestamp(1).toLocalDateTime(), rs.getBigDecimal(2),
                        rs.getInt(3), rs.getString(4)));
    }

    private static boolean dentro(LocalDate dia, LocalDate inicial, LocalDate fim) {
        return (inicial == null || !dia.isBefore(inicial)) && (fim == null || !dia.isAfter(fim));
    }

    private static BigDecimal soma(List<Pagamento> lista) {
        return lista.stream().map(Pagamento::valor).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<LinhaDia> esperadoPorDia(LocalDate inicial, LocalDate fim) {
        Map<LocalDate, List<Pagamento>> porDia = pagamentos().stream()
                .filter(p -> dentro(p.pagoEm().toLocalDate(), inicial, fim))
                .collect(Collectors.groupingBy(p -> p.pagoEm().toLocalDate(), TreeMap::new, Collectors.toList()));
        return porDia.entrySet().stream()
                .map(e -> new LinhaDia(e.getKey(), soma(e.getValue()), e.getValue().size()))
                .toList();
    }

    private List<LinhaCategoria> esperadoPorCategoria(LocalDate inicial, LocalDate fim) {
        Map<Integer, List<Pagamento>> porCategoria = pagamentos().stream()
                .filter(p -> dentro(p.pagoEm().toLocalDate(), inicial, fim))
                .collect(Collectors.groupingBy(Pagamento::categoriaId));
        return porCategoria.values().stream()
                .map(l -> new LinhaCategoria(l.get(0).categoriaId(), l.get(0).categoria(), soma(l), l.size()))
                .sorted(Comparator.<LinhaCategoria, BigDecimal>comparing(LinhaCategoria::total).reversed()
                        .thenComparing(LinhaCategoria::nome))
                .toList();
    }

    private List<LocalDate> diasComPagamento() {
        List<LocalDate> dias = pagamentos().stream()
                .map(p -> p.pagoEm().toLocalDate()).distinct().sorted().toList();
        assertThat(dias.size()).as("a massa de dados precisa ter pagamentos em pelo menos 4 dias distintos")
                .isGreaterThanOrEqualTo(4);
        return dias;
    }

    private static long centavos(BigDecimal valor) {
        return valor.setScale(2, RoundingMode.HALF_UP).unscaledValue().longValue();
    }

    private String chamar(String url) throws Exception {
        return mockMvc.perform(get(url)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
    }

    private void conferirPorDia(String url, List<LinhaDia> esperado) throws Exception {
        String json = chamar(url);
        List<String> datas = JsonPath.read(json, "$[*].data");
        List<Number> totais = JsonPath.read(json, "$[*].receitaTotal");
        List<Number> quantidades = JsonPath.read(json, "$[*].quantidadeSolicitacoes");

        assertThat(datas).containsExactlyElementsOf(esperado.stream().map(l -> l.data().toString()).toList());
        assertThat(totais.stream().map(n -> Math.round(n.doubleValue() * 100)).toList())
                .containsExactlyElementsOf(esperado.stream().map(l -> centavos(l.total())).toList());
        assertThat(quantidades.stream().map(Number::longValue).toList())
                .containsExactlyElementsOf(esperado.stream().map(LinhaDia::quantidade).toList());
    }

    private void conferirPorCategoria(String url, List<LinhaCategoria> esperado) throws Exception {
        String json = chamar(url);
        List<Number> ids = JsonPath.read(json, "$[*].categoriaId");
        List<String> nomes = JsonPath.read(json, "$[*].categoria");
        List<Number> totais = JsonPath.read(json, "$[*].receitaTotal");
        List<Number> quantidades = JsonPath.read(json, "$[*].quantidadeSolicitacoes");

        assertThat(ids.stream().map(Number::intValue).toList())
                .containsExactlyElementsOf(esperado.stream().map(LinhaCategoria::id).toList());
        assertThat(nomes).containsExactlyElementsOf(esperado.stream().map(LinhaCategoria::nome).toList());
        assertThat(totais.stream().map(n -> Math.round(n.doubleValue() * 100)).toList())
                .containsExactlyElementsOf(esperado.stream().map(l -> centavos(l.total())).toList());
        assertThat(quantidades.stream().map(Number::longValue).toList())
                .containsExactlyElementsOf(esperado.stream().map(LinhaCategoria::quantidade).toList());
    }

    private void inserirPagamento(BigDecimal valor, LocalDateTime pagoEm) {
        Integer cliente = jdbc.queryForObject("select min(usuario_id) from cliente", Integer.class);
        Integer categoria = jdbc.queryForObject("select min(id) from categoria_equipamento", Integer.class);
        Integer paga = jdbc.queryForObject("select id from estado_solicitacao where codigo = 'PAGA'", Integer.class);
        jdbc.update("""
                insert into solicitacao (cliente_id, categoria_id, estado_id, descricao_equipamento,
                    descricao_defeito, data_hora_abertura, valor_orcado, data_hora_pagamento)
                values (?, ?, ?, 'Teste de fronteira', 'Teste', ?, ?, ?)
                """, cliente, categoria, paga, Timestamp.valueOf(pagoEm.minusDays(3)), valor, Timestamp.valueOf(pagoEm));
    }

    @Test
    void receitaPorDiaSemFiltroAgrupaPelaDataDePagamento() throws Exception {
        List<LinhaDia> esperado = esperadoPorDia(null, null);

        assertThat(esperado).isNotEmpty();
        conferirPorDia(POR_DIA, esperado);
    }

    @Test
    void receitaPorDiaComPeriodoInclusivoNasDuasPontas() throws Exception {
        List<LocalDate> dias = diasComPagamento();
        LocalDate inicial = dias.get(dias.size() / 4);
        LocalDate fim = dias.get(dias.size() * 3 / 4);

        List<LinhaDia> esperado = esperadoPorDia(inicial, fim);

        assertThat(esperado.get(0).data()).isEqualTo(inicial);
        assertThat(esperado.get(esperado.size() - 1).data()).isEqualTo(fim);
        conferirPorDia(POR_DIA + "?dataInicial=" + inicial + "&dataFinal=" + fim, esperado);
    }

    @Test
    void receitaPorDiaSomenteComDataInicial() throws Exception {
        List<LocalDate> dias = diasComPagamento();
        LocalDate inicial = dias.get(dias.size() / 2);

        conferirPorDia(POR_DIA + "?dataInicial=" + inicial, esperadoPorDia(inicial, null));
    }

    @Test
    void receitaPorDiaSomenteComDataFinal() throws Exception {
        List<LocalDate> dias = diasComPagamento();
        LocalDate fim = dias.get(dias.size() / 2);

        conferirPorDia(POR_DIA + "?dataFinal=" + fim, esperadoPorDia(null, fim));
    }

    @Test
    void pagamentoPertoDaMeiaNoiteCaiNoDiaCorreto() throws Exception {
        inserirPagamento(new BigDecimal("111.11"), LocalDateTime.of(2099, 6, 15, 23, 59, 59));
        inserirPagamento(new BigDecimal("222.22"), LocalDateTime.of(2099, 6, 16, 0, 0, 0));

        mockMvc.perform(get(POR_DIA + "?dataInicial=2099-06-15&dataFinal=2099-06-15"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].data").value("2099-06-15"))
                .andExpect(jsonPath("$[0].receitaTotal").value(111.11))
                .andExpect(jsonPath("$[0].quantidadeSolicitacoes").value(1));

        mockMvc.perform(get(POR_DIA + "?dataInicial=2099-06-16&dataFinal=2099-06-16"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].data").value("2099-06-16"))
                .andExpect(jsonPath("$[0].receitaTotal").value(222.22));

        mockMvc.perform(get(POR_DIA + "?dataInicial=2099-06-15&dataFinal=2099-06-16"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void periodoSemPagamentosRetornaListaVazia() throws Exception {
        mockMvc.perform(get(POR_DIA + "?dataInicial=2000-01-01&dataFinal=2000-01-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
        mockMvc.perform(get(POR_CATEGORIA + "?dataInicial=2000-01-01&dataFinal=2000-01-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void dataInicialPosteriorAFinalRetorna400() throws Exception {
        mockMvc.perform(get(POR_DIA + "?dataInicial=2026-10-20&dataFinal=2026-10-01"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("A data inicial não pode ser posterior à data final."));

        mockMvc.perform(get(POR_CATEGORIA + "?dataInicial=2026-10-20&dataFinal=2026-10-01"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void dataEmFormatoInvalidoRetorna400() throws Exception {
        mockMvc.perform(get(POR_DIA + "?dataInicial=ontem"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.campos[0].campo").value("dataInicial"));
    }

    @Test
    void receitaPorCategoriaSemFiltroOrdenadaPelaMaiorReceita() throws Exception {
        List<LinhaCategoria> esperado = esperadoPorCategoria(null, null);

        assertThat(esperado).isNotEmpty();
        conferirPorCategoria(POR_CATEGORIA, esperado);
    }

    @Test
    void receitaPorCategoriaRespeitaOPeriodoDePagamento() throws Exception {
        List<LocalDate> dias = diasComPagamento();
        LocalDate inicial = dias.get(dias.size() / 4);
        LocalDate fim = dias.get(dias.size() * 3 / 4);

        conferirPorCategoria(POR_CATEGORIA + "?dataInicial=" + inicial + "&dataFinal=" + fim,
                esperadoPorCategoria(inicial, fim));
    }

    @Test
    void categoriaSemPagamentosNaoApareceNoRelatorio() throws Exception {
        List<String> semPagamento = jdbc.queryForList("""
                select nome from categoria_equipamento
                where id not in (select categoria_id from solicitacao where data_hora_pagamento is not null)
                """, String.class);

        List<String> nomes = JsonPath.read(chamar(POR_CATEGORIA), "$[*].categoria");

        assertThat(nomes).doesNotContainAnyElementsOf(semPagamento);
    }

    @Test
    void osDoisRelatoriosFecham() throws Exception {
        BigDecimal esperado = soma(pagamentos());

        double totalPorDia = JsonPath.<List<Number>>read(chamar(POR_DIA), "$[*].receitaTotal").stream()
                .mapToDouble(Number::doubleValue).sum();
        double totalPorCategoria = JsonPath.<List<Number>>read(chamar(POR_CATEGORIA), "$[*].receitaTotal").stream()
                .mapToDouble(Number::doubleValue).sum();

        assertThat(totalPorDia).isCloseTo(esperado.doubleValue(), within(0.001));
        assertThat(totalPorCategoria).isCloseTo(esperado.doubleValue(), within(0.001));
    }

    @Test
    void orcamentosDeSolicitacoesNaoPagasNaoEntramNaReceita() throws Exception {
        BigDecimal orcadoSemPagamento = jdbc.queryForObject(
                "select coalesce(sum(valor_orcado), 0) from solicitacao where data_hora_pagamento is null",
                BigDecimal.class);
        BigDecimal orcadoTotal = jdbc.queryForObject(
                "select coalesce(sum(valor_orcado), 0) from solicitacao", BigDecimal.class);

        assertThat(orcadoSemPagamento).as("a massa precisa ter orcamentos de solicitacoes ainda nao pagas")
                .isPositive();

        double receita = JsonPath.<List<Number>>read(chamar(POR_DIA), "$[*].receitaTotal").stream()
                .mapToDouble(Number::doubleValue).sum();

        assertThat(receita).isLessThan(orcadoTotal.doubleValue());
        assertThat(receita).isCloseTo(orcadoTotal.subtract(orcadoSemPagamento).doubleValue(), within(0.001));
    }
}