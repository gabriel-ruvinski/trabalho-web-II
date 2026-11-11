package br.ufpr.tads.categoria;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.ufpr.tads.dto.CategoriaDTO;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService service;

    public CategoriaController(CategoriaService service){
        this.service = service;
    }

    @GetMapping
    public List<Categoria> listar(){
        return service.listar(); 
    }


    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(service.buscarPorId(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity <?> cadastrar (
        @Valid @RequestBody CategoriaDTO dto){
            try{
                Categoria categoria =  service.cadastrar(dto.getNome());

                return ResponseEntity.status(HttpStatus.CREATED).body(categoria);
            
            } catch (IllegalArgumentException e){
                return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
            }
    }

     @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(
        @PathVariable Integer id,
        @Valid @RequestBody CategoriaDTO dto
    ) {
        try {
            Categoria categoria = service.atualizar(id, dto.getNome());

            return ResponseEntity.ok(categoria);

        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> remover(@PathVariable Integer id) {
        try {
            service.remover(id);

            return ResponseEntity.noContent().build();

        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/inativas")
    public List<Categoria> listarInativas() {
        return service.listarInativas();
    }

    @PutMapping("/{id}/reativar")
    public ResponseEntity<?> reativar(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(service.reativar(id));

        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("erro", e.getMessage()));
        }
    }
}