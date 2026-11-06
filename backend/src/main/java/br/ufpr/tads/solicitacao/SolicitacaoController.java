package br.ufpr.tads.solicitacao;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.ufpr.tads.dto.CriarSolicitacaoDTO;
import br.ufpr.tads.dto.SolicitacaoResponseDTO;

@RestController
@RequestMapping("/api/solicitacoes")
public class SolicitacaoController {

    private final SolicitacaoService service;

    public SolicitacaoController(SolicitacaoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<SolicitacaoResponseDTO> abrir(
            @RequestParam(required = false) Integer solicitanteId,
            @Valid @RequestBody CriarSolicitacaoDTO dto) {
        Solicitacao criada = service.abrir(
            solicitanteId, dto.categoriaId(), dto.descricaoEquipamento(), dto.descricaoDefeito());
        return ResponseEntity
            .created(URI.create("/api/solicitacoes/" + criada.getId()))
            .body(SolicitacaoResponseDTO.de(criada));
    }

    @GetMapping("/cliente/{clienteId}")
    public List<SolicitacaoResponseDTO> listarDoCliente(
            @PathVariable Integer clienteId,
            @RequestParam(required = false) Integer solicitanteId) {
        return service.listarDoCliente(clienteId, solicitanteId).stream()
            .map(SolicitacaoResponseDTO::de)
            .toList();
    }

    @GetMapping("/abertas")
    public List<SolicitacaoResponseDTO> listarAbertas(
            @RequestParam(required = false) Integer solicitanteId) {
        return service.listarAbertas(solicitanteId).stream()
            .map(SolicitacaoResponseDTO::de)
            .toList();
    }

    @GetMapping
    public List<SolicitacaoResponseDTO> listarParaFuncionario(
            @RequestParam(required = false) String filtro,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(required = false) Integer solicitanteId) {
        return service.listarParaFuncionario(filtro, inicio, fim, solicitanteId).stream()
            .map(SolicitacaoResponseDTO::de)
            .toList();
    }

    @GetMapping("/{id}")
    public SolicitacaoResponseDTO consultar(
            @PathVariable Long id,
            @RequestParam(required = false) Integer solicitanteId) {
        return SolicitacaoResponseDTO.de(service.consultar(id, solicitanteId));
    }
}
