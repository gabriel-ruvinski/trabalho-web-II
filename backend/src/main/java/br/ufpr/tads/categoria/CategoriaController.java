package br.ufpr.tads.categoria;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        @RequestBody Map<String, String> dados){
            try{
                Categoria categoria =  service.cadastrar(dados.get("nome"));

                return ResponseEntity.status(HttpStatus.CREATED).body(categoria);
            
            } catch (IllegalArgumentException e){
                return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
            }
    }

     @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(
        @PathVariable Integer id,
        @RequestBody Map<String, String> dados
    ) {
        try {
            Categoria categoria = service.atualizar(id, dados.get("nome"));

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
}