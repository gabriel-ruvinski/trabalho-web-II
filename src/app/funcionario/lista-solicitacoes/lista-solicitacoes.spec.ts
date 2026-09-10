import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaSolicitacoes } from './lista-solicitacoes';

describe('ListaSolicitacoes', () => {
  let component: ListaSolicitacoes;
  let fixture: ComponentFixture<ListaSolicitacoes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaSolicitacoes],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaSolicitacoes);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve ordenar as solicitações da mais recente para a mais antiga', () => {
    const solicitacoes = component.solicitacoesFiltradas;

    for (let i = 0; i < solicitacoes.length - 1; i++) {
      const atual = new Date(solicitacoes[i].dataAbertura).getTime();
      const proxima = new Date(solicitacoes[i + 1].dataAbertura).getTime();

      expect(atual).toBeGreaterThanOrEqual(proxima);
    }
  });

  it('deve filtrar solicitações por período', () => {
    component.filtro = 'PERIODO';
    component.dataInicio = '2026-09-08';
    component.dataFim = '2026-09-09';

    const resultado = component.solicitacoesFiltradas;

    expect(resultado.length).toBeGreaterThan(0);

    resultado.forEach(solicitacao => {
      const data = new Date(solicitacao.dataAbertura);

      expect(data >= new Date('2026-09-08T00:00:00')).toBeTrue();
      expect(data <= new Date('2026-09-09T23:59:59')).toBeTrue();
    });
  });

  it('deve retornar somente solicitações redirecionadas para o funcionário atual', () => {
    const redirecionadas = component.solicitacoesFiltradas
      .filter(s => s.estado === 'REDIRECIONADA');

    redirecionadas.forEach(solicitacao => {
      expect(solicitacao.destinoRedirecionamento).toBeTrue();
    });
  });

  it('deve associar a cor correta a cada estado', () => {
    expect(component.getClasseEstado('ABERTA'))
      .toBe('estado-aberta');

    expect(component.getClasseEstado('ORÇADA'))
      .toBe('estado-orcada');

    expect(component.getClasseEstado('REJEITADA'))
      .toBe('estado-rejeitada');

    expect(component.getClasseEstado('APROVADA'))
      .toBe('estado-aprovada');

    expect(component.getClasseEstado('REDIRECIONADA'))
      .toBe('estado-redirecionada');

    expect(component.getClasseEstado('ARRUMADA'))
      .toBe('estado-arrumada');

    expect(component.getClasseEstado('PAGA'))
      .toBe('estado-paga');

    expect(component.getClasseEstado('FINALIZADA'))
      .toBe('estado-finalizada');
  });
});
