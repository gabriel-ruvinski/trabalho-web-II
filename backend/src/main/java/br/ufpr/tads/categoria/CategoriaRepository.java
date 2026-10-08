package br.ufpr.tads.categoria;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
    
    boolean existsByNomeIgnoreCase (String nome);
        
}