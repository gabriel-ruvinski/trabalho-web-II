package br.ufpr.tads.solicitacao;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SolicitacaoRepository extends JpaRepository<Solicitacao, Long> {

    @Query("""
        select distinct s from Solicitacao s
        join fetch s.categoria
        left join fetch s.historico
        where s.clienteId = :clienteId
        order by s.dataHoraAbertura asc
        """)
    List<Solicitacao> listarPorCliente(@Param("clienteId") Integer clienteId);

    @Query("""
        select distinct s from Solicitacao s
        join fetch s.categoria
        left join fetch s.historico
        where s.estadoId = :estadoId
        order by s.dataHoraAbertura asc
        """)
    List<Solicitacao> listarPorEstado(@Param("estadoId") Integer estadoId);

    @Query("""
        select distinct s from Solicitacao s
        join fetch s.categoria
        left join fetch s.historico
        where s.dataHoraAbertura >= :inicio and s.dataHoraAbertura < :fim
        order by s.dataHoraAbertura asc
        """)
    List<Solicitacao> listarPorPeriodoAbertura(
        @Param("inicio") LocalDateTime inicio,
        @Param("fim") LocalDateTime fim);

    @Query("""
        select distinct s from Solicitacao s
        join fetch s.categoria
        left join fetch s.historico
        where s.funcionarioDestinoId = :funcionarioId
        order by s.dataHoraAbertura asc
        """)
    List<Solicitacao> listarPorFuncionarioDestino(@Param("funcionarioId") Integer funcionarioId);
}