
package br.ufpr.tads.solicitacao;

import br.ufpr.tads.solicitacao.dto.RegistrarOrcamentoDTO;
import br.ufpr.tads.solicitacao.dto.RejeitarOrcamentoDTO;
import br.ufpr.tads.solicitacao.dto.RegistrarManutencaoDTO;
import br.ufpr.tads.solicitacao.dto.RedirecionarSolicitacaoDTO;
import br.ufpr.tads.solicitacao.dto.RegistrarPagamentoDTO;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            @RequestBody RegistrarOrcamentoDTO dto) {

        fluxoService.registrarOrcamento(
                id, dto.getValor(), dto.getFuncionarioId());

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/aprovar-orcamento")
    public ResponseEntity<Void> aprovarOrcamento(
            @PathVariable Long id,
            @RequestBody RegistrarPagamentoDTO dto) {

        fluxoService.aprovarOrcamento(id, dto.getUsuarioId());

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/rejeitar-orcamento")
    public ResponseEntity<Void> rejeitarOrcamento(
            @PathVariable Long id,
            @RequestBody RejeitarOrcamentoDTO dto) {

        fluxoService.rejeitarOrcamento(
                id, dto.getUsuarioId(), dto.getMotivo());

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/resgatar")
    public ResponseEntity<Void> resgatar(
            @PathVariable Long id,
            @RequestBody RegistrarPagamentoDTO dto) {

        fluxoService.resgatarSolicitacao(id, dto.getUsuarioId());

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/manutencao")
    public ResponseEntity<Void> registrarManutencao(
            @PathVariable Long id,
            @RequestBody RegistrarManutencaoDTO dto) {

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
            @RequestBody RedirecionarSolicitacaoDTO dto) {

        fluxoService.redirecionarFuncionario(
                id,
                dto.getFuncionarioAtualId(),
                dto.getFuncionarioDestinoId());

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/pagamento")
    public ResponseEntity<Void> registrarPagamento(
            @PathVariable Long id,
            @RequestBody RegistrarPagamentoDTO dto) {

        fluxoService.registrarPagamento(id, dto.getUsuarioId());

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<Void> finalizar(
            @PathVariable Long id,
            @RequestBody RegistrarPagamentoDTO dto) {

        fluxoService.finalizarSolicitacao(id, dto.getUsuarioId());

        return ResponseEntity.noContent().build();
    }
}
