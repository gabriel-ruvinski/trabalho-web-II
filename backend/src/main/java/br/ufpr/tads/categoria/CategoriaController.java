package br.ufpr.tads.categoria;

import java.util.List;
import java.util.Map;

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
}