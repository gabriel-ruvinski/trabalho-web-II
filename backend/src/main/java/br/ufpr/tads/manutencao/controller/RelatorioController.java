package br.ufpr.tads.manutencao.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/relatorios")
@Tag(name = "Relatórios", description = "Relatórios de receita das solicitações pagas")
public class RelatorioController {

    private final RelatorioService service;

    public RelatorioController(RelatorioService service) {
        this.service = service;
    }

    @GetMapping("/receita-por-dia")
    @Operation(summary = "Receita agrupada por dia de pagamento",
            description = "Soma o valor orçado das solicitações com pagamento registrado, "
                    + "agrupando pela data do pagamento. As duas datas são opcionais e inclusivas.")
    public List<ReceitaDiariaDTO> receitaPorDia(
            @Parameter(description = "Primeiro dia do período (yyyy-MM-dd)", example = "2026-10-01")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicial,

            @Parameter(description = "Último dia do período (yyyy-MM-dd)", example = "2026-10-31")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFinal) {

        return service.receitaPorDia(dataInicial, dataFinal);
    }

    @GetMapping("/receita-por-categoria")
    @Operation(summary = "Receita agrupada por categoria de equipamento",
            description = "Soma o valor orçado das solicitações com pagamento registrado, "
                    + "agrupando pela categoria do equipamento. As duas datas (data do pagamento) "
                    + "são opcionais e inclusivas. Categorias sem receita no período não aparecem.")
    public List<ReceitaCategoriaDTO> receitaPorCategoria(
            @Parameter(description = "Primeiro dia do período (yyyy-MM-dd)", example = "2026-10-01")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicial,

            @Parameter(description = "Último dia do período (yyyy-MM-dd)", example = "2026-10-31")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFinal) {

        return service.receitaPorCategoria(dataInicial, dataFinal);
    }
}
