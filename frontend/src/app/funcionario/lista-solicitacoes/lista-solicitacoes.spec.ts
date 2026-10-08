import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ListaSolicitacoes } from './lista-solicitacoes';

describe('ListaSolicitacoes', () => {
  let component: ListaSolicitacoes;
  let fixture: ComponentFixture<ListaSolicitacoes>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ListaSolicitacoes],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaSolicitacoes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve ordenar as solicitações da mais antiga para a mais recente', () => {
    const solicitacoes = component.solicitacoesFiltradas;
    for (let i = 0; i < solicitacoes.length - 1; i++) {
      expect(solicitacoes[i].dataHoraAbertura.getTime()).toBeLessThanOrEqual(
        solicitacoes[i + 1].dataHoraAbertura.getTime(),
      );
    }
  });

  it('deve filtrar solicitações por período', () => {
    component.filtro = 'PERIODO';
    component.dataInicio = '2026-09-08';
    component.dataFim = '2026-09-09';
    const resultado = component.solicitacoesFiltradas;
    expect(resultado.length).toBeGreaterThan(0);
    resultado.forEach((solicitacao) => {
      const data = solicitacao.dataHoraAbertura;
      expect(data >= new Date('2026-09-08T00:00:00')).toBe(true);
      expect(data <= new Date('2026-09-09T23:59:59')).toBe(true);
    });
  });

  it('deve retornar somente solicitações redirecionadas para o funcionário atual', () => {
    const redirecionadas = component.solicitacoesFiltradas.filter(
      (s) => s.estado === 'REDIRECIONADA',
    );
    redirecionadas.forEach((solicitacao) => {
      expect(solicitacao.funcionarioDestinoId).toBe(component.funcionarioLogadoId);
    });
  });

  it('deve associar a cor correta a cada estado', () => {
    expect(component.getClasseEstado('ABERTA')).toBe('bg-estado-aberta text-white');
    expect(component.getClasseEstado('ORCADA')).toBe('bg-estado-orcada text-white');
    expect(component.getClasseEstado('REJEITADA')).toBe('bg-estado-rejeitada text-white');
    expect(component.getClasseEstado('APROVADA')).toBe('bg-estado-aprovada text-white');
    expect(component.getClasseEstado('REDIRECIONADA')).toBe('bg-estado-redirecionada text-white');
    expect(component.getClasseEstado('ARRUMADA')).toBe('bg-estado-arrumada text-white');
    expect(component.getClasseEstado('PAGA')).toBe('bg-estado-paga text-white');
    expect(component.getClasseEstado('FINALIZADA')).toBe('bg-estado-finalizada text-white');
  });
});
