package br.ufpr.tads.cliente;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {

    boolean existsByCpf(String cpf);

    boolean existsByCpfAndUsuarioIdNot(String cpf, Integer usuarioId);

    List<Cliente> findAllByUsuarioAtivoTrueOrderByUsuarioNomeAsc();
}