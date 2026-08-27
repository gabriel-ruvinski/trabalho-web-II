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
    expect(service.listar()).toHaveLength(1);
  });
});
