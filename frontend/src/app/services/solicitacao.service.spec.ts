import { TestBed } from '@angular/core/testing';
import { SolicitacaoService } from './solicitacao.service';

describe('SolicitacaoService', () => {
  let service: SolicitacaoService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolicitacaoService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('deve criar solicitação no estado ABERTA com data/hora', () => {
    const criada = service.criar({
      descricaoEquipamento: 'Notebook Dell Inspiron',
      categoriaId: 1,
      descricaoDefeito: 'Não liga após queda',
    });

    expect(criada.estado).toBe('ABERTA');
    expect(criada.categoriaNome).toBe('Notebook');
    expect(criada.dataHoraAbertura).toBeInstanceOf(Date);
    expect(criada.historico[0].estado).toBe('ABERTA');
  });

  it('deve orçar uma solicitação ABERTA', () => {
    const criada = service.criar({
      descricaoEquipamento: 'Impressora laser',
      categoriaId: 3,
      descricaoDefeito: 'Não imprime',
    });
    const orcada = service.efetuarOrcamento(criada.id, 199.9, 'Maria');
    expect(orcada.estado).toBe('ORCADA');
    expect(orcada.valorOrcamento).toBe(199.9);
    expect(orcada.historico.at(-1)?.funcionarioNome).toBe('Maria');
  });

  it('deve finalizar uma solicitação PAGA', () => {
    localStorage.clear();
    const paga = service.listar().find((item) => item.estado === 'PAGA');
    expect(paga).toBeTruthy();
    const finalizada = service.finalizar(paga!.id, 'Mário');
    expect(finalizada.estado).toBe('FINALIZADA');
    expect(finalizada.historico.at(-1)?.funcionarioNome).toBe('Mário');
  });
});
