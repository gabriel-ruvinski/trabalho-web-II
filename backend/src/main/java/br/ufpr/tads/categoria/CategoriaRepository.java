package br.ufpr.tads.categoria;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
    
    List<Categoria> findAllByAtivoTrue();

    boolean existsByNomeIgnoreCase (String nome);

    boolean existsByNomeIgnoreCaseAndIdNot (String nome, Integer id);
        
}