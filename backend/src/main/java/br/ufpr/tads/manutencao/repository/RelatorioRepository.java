package br.ufpr.tads.manutencao.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import br.ufpr.tads.solicitacao.Solicitacao;
import br.ufpr.tads.manutencao.dto.ReceitaCategoriaDTO;
import br.ufpr.tads.manutencao.dto.ReceitaDiariaDTO;

public interface RelatorioRepository extends Repository<Solicitacao, Long> {

    @Query("""
        select new br.ufpr.tads.manutencao.dto.ReceitaDiariaDTO(
            cast(s.dataHoraPagamento as LocalDate),
            sum(s.valorOrcado),
            count(s))
        from Solicitacao s
        where s.dataHoraPagamento is not null
          and s.valorOrcado is not null
          and s.dataHoraPagamento >= :inicio
          and s.dataHoraPagamento < :fimExclusivo
        group by cast(s.dataHoraPagamento as LocalDate)
        order by cast(s.dataHoraPagamento as LocalDate) asc
        """)
    List<ReceitaDiariaDTO> receitaPorDia(
            @Param("inicio") LocalDateTime inicio,
            @Param("fimExclusivo") LocalDateTime fimExclusivo);

    @Query("""
        select new br.ufpr.tads.manutencao.dto.ReceitaCategoriaDTO(
            c.id,
            c.nome,
            sum(s.valorOrcado),
            count(s))
        from Solicitacao s
        join s.categoria c
        where s.dataHoraPagamento is not null
          and s.valorOrcado is not null
          and s.dataHoraPagamento >= :inicio
          and s.dataHoraPagamento < :fimExclusivo
        group by c.id, c.nome
        order by sum(s.valorOrcado) desc, c.nome asc
        """)
    List<ReceitaCategoriaDTO> receitaPorCategoria(
            @Param("inicio") LocalDateTime inicio,
            @Param("fimExclusivo") LocalDateTime fimExclusivo);
}
