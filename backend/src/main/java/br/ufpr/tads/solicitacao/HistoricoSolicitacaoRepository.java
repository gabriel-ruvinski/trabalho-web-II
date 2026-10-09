package br.ufpr.tads.solicitacao;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HistoricoSolicitacaoRepository extends JpaRepository<HistoricoSolicitacao, Long> {

    List<HistoricoSolicitacao> findBySolicitacaoIdOrderByDataHoraAsc(Long solicitacaoId);
}