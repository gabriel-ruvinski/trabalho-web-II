import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoSolicitacao } from './historico-solicitacao';

describe('HistoricoSolicitacao', () => {
  let component: HistoricoSolicitacao;
  let fixture: ComponentFixture<HistoricoSolicitacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoSolicitacao],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoricoSolicitacao);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
