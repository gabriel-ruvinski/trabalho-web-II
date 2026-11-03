package br.ufpr.tads.categoria;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoriaService{

    private final CategoriaRepository repository;

    public CategoriaService (CategoriaRepository repository){
        this.repository = repository;
    }

    public List<Categoria> listar(){
        return repository.findAllByAtivoTrue();
    }

    public Categoria buscarPorId(Integer id) {
        Categoria categoria = repository.findById(id)
            .orElseThrow(() -> new NoSuchElementException(
                "Categoria não encontrada."
    ));
       if (!categoria.isAtivo()) {
            throw new NoSuchElementException(
                "Categoria não encontrada."
            );
       }

       return categoria;
}

    @Transactional
    public Categoria cadastrar (String nome){
        
    validarNome(nome);

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

    @Transactional
    public Categoria atualizar(Integer id, String nome) {

        validarNome(nome);

        Categoria categoria = buscarPorId(id);

        nome = nome.trim();

        if (repository.existsByNomeIgnoreCaseAndIdNot(nome, id)) {
            throw new IllegalArgumentException(
                "Nome de categoria já existente, tente outro nome."
            );
        }
        categoria.setNome(nome);

        return repository.save(categoria);
    }

     @Transactional
    public void remover(Integer id) {

        Categoria categoria = buscarPorId(id);

        categoria.setAtivo(false);

        repository.save(categoria);
    }

    private void validarNome(String nome) {

        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException(
                "O nome da categoria é obrigatório."
            );
        }
    }


}