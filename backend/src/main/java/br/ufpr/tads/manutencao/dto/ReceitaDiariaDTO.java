package br.ufpr.tads.relatorio;

import java.math.BigDecimal;
import java.time.LocalDate;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Receita de um dia: soma do valor orçado das solicitações cujo pagamento
 * foi registrado naquela data.
 */
@Schema(description = "Receita de um dia, agrupada pela data de pagamento")
public record ReceitaDiariaDTO(
        @Schema(description = "Dia do pagamento", example = "2026-10-05")
        LocalDate data,

        @Schema(description = "Soma do valor orçado das solicitações pagas no dia", example = "1270.50")
        BigDecimal receitaTotal,

        @Schema(description = "Quantidade de solicitações pagas no dia", example = "2")
        Long quantidadeSolicitacoes) {
}
