package br.ufpr.tads.categoria;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoriaService{

    private final CategoriaRepository repository;

    public CategoriaService (CategoriaRepository repository){
        this.repository = repository;
    }

    public List<Categoria> listar(){
        return repository.findAll();
    }

    @Transactional
    public Categoria cadastrar (String nome){
        if (nome == null || nome.isBlank()){
            throw new IllegalArgumentException(
                "O nome é da categoria é obtigatório"
            );
        }

    nome = nome.trim();

    if (repository.existsByNomeIgnoreCase(nome)){
        throw new IllegalArgumentException(
            "Nome de categotia já existente, tente outro nome"
        );
    }

    Categoria categoria = new Categoria();
    categoria.setNome(nome);
    categoria.setAtivo(true);

    return repository.save(categoria);

    }   

}