package br.ufpr.tads.solicitacao;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FluxoSolicitacaoServiceTest {

    @Mock
    private SolicitacaoRepository solicitacaoRepository;

    @Mock
    private HistoricoSolicitacaoRepository historicoRepository;

    @Mock
    private EstadoSolicitacaoRepository estadoRepository;

    @InjectMocks
    private FluxoSolicitacaoService fluxoService;

    @Test
    void deveRejeitarOrcamentoNegativo() {
        assertThrows(
                IllegalArgumentException.class,
                () -> fluxoService.registrarOrcamento(
                        1L,
                        new BigDecimal("-10.00"),
                        2
                )
        );

        verifyNoInteractions(
                solicitacaoRepository,
                historicoRepository,
                estadoRepository
        );
    }

    @Test
    void deveFalharQuandoSolicitacaoNaoExiste() {
        when(solicitacaoRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(
                IllegalArgumentException.class,
                () -> fluxoService.registrarPagamento(1L, 2)
        );

        verify(solicitacaoRepository).findById(1L);
        verifyNoInteractions(historicoRepository);
    }
}
