import { TestBed } from '@angular/core/testing';
import { RelatorioService } from './relatorio.service';

describe('RelatorioService', () => {
  let service: RelatorioService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(RelatorioService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('agrupa receita por dia usando a data do pagamento', () => {
    const porDia = service.receitaPorDia();
    const dia08 = porDia.find((linha) => linha.dataIso === '2026-09-08');
    expect(dia08?.valor).toBe(380);
  });

  it('respeita filtro de período com datas opcionais', () => {
    const soDia06 = service.receitaPorDia('2026-09-06', '2026-09-06');
    expect(soDia06).toHaveLength(1);
    expect(soDia06[0].valor).toBe(450);
  });

  it('agrupa receita por categoria desde sempre', () => {
    const porCategoria = service.receitaPorCategoria();
    const notebook = porCategoria.find((linha) => linha.categoriaNome === 'Notebook');
    const mouse = porCategoria.find((linha) => linha.categoriaNome === 'Mouse');
    expect(notebook?.valor).toBe(450);
    expect(mouse?.valor).toBe(0);
  });
});
