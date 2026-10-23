package br.ufpr.tads.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CriarSolicitacaoDTO(
    @NotNull(message = "A categoria é obrigatória")
    Integer categoriaId,

    @NotBlank(message = "A descrição do equipamento é obrigatória")
    @Size(max = 255, message = "A descrição do equipamento deve ter no máximo 255 caracteres")
    String descricaoEquipamento,

    @NotBlank(message = "A descrição do defeito é obrigatória")
    String descricaoDefeito) {
}