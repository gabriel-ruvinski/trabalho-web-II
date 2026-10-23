package br.ufpr.tads.manutencao.dto;

import java.math.BigDecimal;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Receita de uma categoria de equipamento")
public record ReceitaCategoriaDTO(
        @Schema(description = "Identificador da categoria", example = "1")
        Integer categoriaId,

        @Schema(description = "Nome da categoria", example = "Notebook")
        String categoria,

        @Schema(description = "Soma do valor orçado das solicitações pagas da categoria", example = "2780.50")
        BigDecimal receitaTotal,

        @Schema(description = "Quantidade de solicitações pagas da categoria", example = "4")
        Long quantidadeSolicitacoes) {
}
