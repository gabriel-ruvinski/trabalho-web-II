
package br.ufpr.tads.solicitacao;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.ufpr.tads.dto.RedirecionarSolicitacaoDTO;
import br.ufpr.tads.dto.RegistrarManutencaoDTO;
import br.ufpr.tads.dto.RegistrarOrcamentoDTO;
import br.ufpr.tads.dto.RegistrarPagamentoDTO;
import br.ufpr.tads.dto.RejeitarOrcamentoDTO;

@RestController
@RequestMapping("/api/solicitacoes")
public class FluxoSolicitacaoController {

    private final FluxoSolicitacaoService fluxoService;

    public FluxoSolicitacaoController(
            FluxoSolicitacaoService fluxoService) {
        this.fluxoService = fluxoService;
    }

    @PostMapping("/{id}/orcamento")
    public ResponseEntity<Void> registrarOrcamento(
            @PathVariable Long id,
            @Valid @RequestBody RegistrarOrcamentoDTO dto) {

        fluxoService.registrarOrcamento(
                id, dto.getValor(), dto.getFuncionarioId());

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/aprovar-orcamento")
    public ResponseEntity<Void> aprovarOrcamento(
            @PathVariable Long id,
            @Valid @RequestBody RegistrarPagamentoDTO dto) {

        fluxoService.aprovarOrcamento(id, dto.getUsuarioId());

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/rejeitar-orcamento")
    public ResponseEntity<Void> rejeitarOrcamento(
            @PathVariable Long id,
            @Valid @RequestBody RejeitarOrcamentoDTO dto) {

        fluxoService.rejeitarOrcamento(
                id, dto.getUsuarioId(), dto.getMotivo());

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/resgatar")
    public ResponseEntity<Void> resgatar(
            @PathVariable Long id,
            @Valid @RequestBody RegistrarPagamentoDTO dto) {

        fluxoService.resgatarSolicitacao(id, dto.getUsuarioId());

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/manutencao")
    public ResponseEntity<Void> registrarManutencao(
            @PathVariable Long id,
            @Valid @RequestBody RegistrarManutencaoDTO dto) {

        fluxoService.registrarManutencao(
                id,
                dto.getFuncionarioId(),
                dto.getDescricao(),
                dto.getOrientacoes());

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/redirecionar")
    public ResponseEntity<Void> redirecionar(
            @PathVariable Long id,
            @Valid @RequestBody RedirecionarSolicitacaoDTO dto) {

        fluxoService.redirecionarFuncionario(
                id,
                dto.getFuncionarioAtualId(),
                dto.getFuncionarioDestinoId());

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/pagamento")
    public ResponseEntity<Void> registrarPagamento(
            @PathVariable Long id,
            @Valid @RequestBody RegistrarPagamentoDTO dto) {

        fluxoService.registrarPagamento(id, dto.getUsuarioId());

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<Void> finalizar(
            @PathVariable Long id,
            @Valid @RequestBody RegistrarPagamentoDTO dto) {

        fluxoService.finalizarSolicitacao(id, dto.getUsuarioId());

        return ResponseEntity.noContent().build();
    }
}
