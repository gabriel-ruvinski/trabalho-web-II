package br.ufpr.tads.solicitacao;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstadoSolicitacaoRepository
        extends JpaRepository<EstadoSolicitacao, Integer> {

    Optional<EstadoSolicitacao> findByCodigo(String codigo);
}