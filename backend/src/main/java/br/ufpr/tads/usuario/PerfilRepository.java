package br.ufpr.tads.usuario;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PerfilRepository extends JpaRepository<Perfil, Integer> {

    Optional<Perfil> findByCodigo(String codigo);
}