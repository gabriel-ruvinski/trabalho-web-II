package br.ufpr.tads.manutencao.service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import br.ufpr.tads.manutencao.dto.ReceitaCategoriaDTO;
import br.ufpr.tads.manutencao.dto.ReceitaDiariaDTO;
import br.ufpr.tads.manutencao.repository.RelatorioRepository;

@Service
@Transactional(readOnly = true)
public class RelatorioService {

    private static final LocalDateTime SEM_LIMITE_INFERIOR = LocalDateTime.of(1900, 1, 1, 0, 0);
    private static final LocalDateTime SEM_LIMITE_SUPERIOR = LocalDateTime.of(9999, 12, 31, 0, 0);

    private final RelatorioRepository repository;

    public RelatorioService(RelatorioRepository repository) {
        this.repository = repository;
    }

    public List<ReceitaDiariaDTO> receitaPorDia(LocalDate dataInicial, LocalDate dataFinal) {
        validarPeriodo(dataInicial, dataFinal);
        return repository.receitaPorDia(inicio(dataInicial), fimExclusivo(dataFinal));
    }

    public List<ReceitaCategoriaDTO> receitaPorCategoria(LocalDate dataInicial, LocalDate dataFinal) {
        validarPeriodo(dataInicial, dataFinal);
        return repository.receitaPorCategoria(inicio(dataInicial), fimExclusivo(dataFinal));
    }

    private void validarPeriodo(LocalDate dataInicial, LocalDate dataFinal) {
        if (dataInicial != null && dataFinal != null && dataInicial.isAfter(dataFinal)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A data inicial não pode ser posterior à data final.");
        }
    }

    private LocalDateTime inicio(LocalDate dataInicial) {
        return dataInicial == null ? SEM_LIMITE_INFERIOR : dataInicial.atStartOfDay();
    }

    private LocalDateTime fimExclusivo(LocalDate dataFinal) {
        return dataFinal == null ? SEM_LIMITE_SUPERIOR : dataFinal.plusDays(1).atStartOfDay();
    }
}