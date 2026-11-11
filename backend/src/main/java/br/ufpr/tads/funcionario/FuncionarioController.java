package br.ufpr.tads.funcionario;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.ufpr.tads.usuario.UsuarioService;

@RestController
@RequestMapping("/api/funcionarios")
public class FuncionarioController {

    private final FuncionarioService service;
    private final UsuarioService usuarioService;

    public FuncionarioController(
            FuncionarioService service,
            UsuarioService usuarioService) {
        this.service = service;
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<Funcionario> listar(
            @RequestParam(name = "solicitanteId", required = false) Integer solicitanteId) {
        usuarioService.exigirFuncionario(solicitanteId);

        return service.listar();
    }

    @GetMapping("/inativos")
    public List<Funcionario> listarInativos(
            @RequestParam(name = "solicitanteId", required = false) Integer solicitanteId) {
        usuarioService.exigirFuncionario(solicitanteId);

        return service.listarInativos();
    }

    @GetMapping("/{id}")
    public Funcionario buscarPorId(
            @PathVariable Integer id,
            @RequestParam(name = "solicitanteId", required = false) Integer solicitanteId) {
        usuarioService.exigirFuncionario(solicitanteId);

        return service.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<Funcionario> cadastrar(
            @Valid @RequestBody FuncionarioDTO dto,
            @RequestParam(name = "solicitanteId", required = false) Integer solicitanteId) {
        usuarioService.exigirFuncionario(solicitanteId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.cadastrar(dto));
    }

    @PutMapping("/{id}")
    public Funcionario atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody FuncionarioDTO dto,
            @RequestParam(name = "solicitanteId", required = false) Integer solicitanteId) {
        usuarioService.exigirFuncionario(solicitanteId);

        return service.atualizar(id, dto);
    }

    @PutMapping("/{id}/reativar")
    public Funcionario reativar(
            @PathVariable Integer id,
            @RequestParam(name = "solicitanteId", required = false) Integer solicitanteId) {
        usuarioService.exigirFuncionario(solicitanteId);

        return service.reativar(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> inativar(
            @PathVariable Integer id,
            @RequestParam(name = "solicitanteId", required = false) Integer solicitanteId) {
        usuarioService.exigirFuncionario(solicitanteId);
        service.inativar(id, solicitanteId);

        return ResponseEntity.noContent().build();
    }
}