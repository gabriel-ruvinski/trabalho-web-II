package br.ufpr.tads.solicitacao;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import br.ufpr.tads.categoria.Categoria;
import br.ufpr.tads.dto.CriarSolicitacaoDTO;
import br.ufpr.tads.dto.SolicitacaoResponseDTO;

@ExtendWith(MockitoExtension.class)
class SolicitacaoControllerTest {

    @Mock
    private SolicitacaoService service;

    @InjectMocks
    private SolicitacaoController controller;

    @Test
    void abrirRetorna201ComLocationEEstadoAberta() {
        Solicitacao criada = solicitacao(7L, 1, 1);
        when(service.abrir(1, 10, "Notebook", "Não liga")).thenReturn(criada);

        ResponseEntity<SolicitacaoResponseDTO> resposta =
            controller.abrir(1, new CriarSolicitacaoDTO(10, "Notebook", "Não liga"));

        assertEquals(HttpStatus.CREATED, resposta.getStatusCode());
        assertEquals("/api/solicitacoes/7", resposta.getHeaders().getLocation().toString());
        assertEquals(7L, resposta.getBody().id());
        assertEquals(1, resposta.getBody().estadoId());
        assertEquals("Notebook", resposta.getBody().categoriaNome());
    }

    @Test
    void listarDoClienteConverteParaDto() {
        when(service.listarDoCliente(1, 1))
            .thenReturn(List.of(solicitacao(1L, 1, 1), solicitacao(2L, 1, 1)));

        List<SolicitacaoResponseDTO> lista = controller.listarDoCliente(1, 1);

        assertEquals(2, lista.size());
        assertEquals(1L, lista.get(0).id());
        assertEquals(2L, lista.get(1).id());
    }

    @Test
    void listarAbertasConverteParaDto() {
        when(service.listarAbertas(2)).thenReturn(List.of(solicitacao(3L, 1, 1)));

        List<SolicitacaoResponseDTO> lista = controller.listarAbertas(2);

        assertEquals(1, lista.size());
        assertEquals(1, lista.get(0).estadoId());
    }

    @Test
    void listarParaFuncionarioRepassaFiltroEPeriodo() {
        LocalDate inicio = LocalDate.of(2026, 5, 1);
        LocalDate fim = LocalDate.of(2026, 5, 3);
        when(service.listarParaFuncionario("PERIODO", inicio, fim, 2)).thenReturn(List.of());

        controller.listarParaFuncionario("PERIODO", inicio, fim, 2);

        verify(service).listarParaFuncionario("PERIODO", inicio, fim, 2);
    }

    @Test
    void consultarInformaResponsavelEHistorico() {
        Solicitacao s = solicitacao(7L, 1, 4);
        s.setFuncionarioOrcamentoId(2);
        HistoricoSolicitacao h = new HistoricoSolicitacao();
        h.setEstadoNovoId(4);
        h.setUsuarioId(2);
        h.setDataHora(LocalDateTime.of(2026, 5, 2, 9, 0));
        s.getHistorico().add(h);
        when(service.consultar(7L, 1)).thenReturn(s);
        when(service.nomesDeFuncionarios(s)).thenReturn(Map.of(2, "Maria"));

        SolicitacaoResponseDTO dto = controller.consultar(7L, 1);

        assertEquals(2, dto.funcionarioResponsavelId());
        assertEquals("Maria", dto.funcionarioResponsavelNome());
        assertEquals(1, dto.historico().size());
        assertNotNull(dto.historico().get(0).dataHora());
        assertEquals("Maria", dto.historico().get(0).funcionarioNome());
    }

    private Solicitacao solicitacao(long id, int clienteId, int estadoId) {
        Categoria categoria = new Categoria();
        categoria.setId(10);
        categoria.setNome("Notebook");
        categoria.setAtivo(true);

        Solicitacao s = new Solicitacao();
        s.setId(id);
        s.setClienteId(clienteId);
        s.setEstadoId(estadoId);
        s.setCategoria(categoria);
        s.setDescricaoEquipamento("Notebook");
        s.setDescricaoDefeito("Não liga");
        s.setDataHoraAbertura(LocalDateTime.of(2026, 5, 1, 10, 0));
        return s;
    }
}
