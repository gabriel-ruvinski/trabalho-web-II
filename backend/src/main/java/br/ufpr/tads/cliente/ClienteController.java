package br.ufpr.tads.cliente;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.ufpr.tads.auth.CadastroClienteRequest;
import br.ufpr.tads.usuario.UsuarioService;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService service;
    private final UsuarioService usuarioService;

    public ClienteController(
            ClienteService service,
            UsuarioService usuarioService) {
        this.service = service;
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<Cliente> listar(
            @RequestParam(name = "solicitanteId", required = false) Integer solicitanteId) {
        usuarioService.exigirFuncionario(solicitanteId);

        return service.listar();
    }

    @GetMapping("/{id}")
    public Cliente buscarPorId(
            @PathVariable Integer id,
            @RequestParam(name = "solicitanteId", required = false) Integer solicitanteId) {
        usuarioService.exigirFuncionario(solicitanteId);

        return service.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<Cliente> cadastrar(
            @Valid @RequestBody CadastroClienteRequest request,
            @RequestParam(name = "solicitanteId", required = false) Integer solicitanteId) {
        usuarioService.exigirFuncionario(solicitanteId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.cadastrar(request));
    }

    @PutMapping("/{id}")
    public Cliente atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody CadastroClienteRequest request,
            @RequestParam(name = "solicitanteId", required = false) Integer solicitanteId) {
        usuarioService.exigirFuncionario(solicitanteId);

        return service.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> inativar(
            @PathVariable Integer id,
            @RequestParam(name = "solicitanteId", required = false) Integer solicitanteId) {
        usuarioService.exigirFuncionario(solicitanteId);
        service.inativar(id);

        return ResponseEntity.noContent().build();
    }
}