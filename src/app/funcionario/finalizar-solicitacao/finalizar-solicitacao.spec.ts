import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalizarSolicitacao } from './finalizar-solicitacao';

describe('FinalizarSolicitacao', () => {
  let component: FinalizarSolicitacao;
  let fixture: ComponentFixture<FinalizarSolicitacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalizarSolicitacao],
    }).compileComponents();

    fixture = TestBed.createComponent(FinalizarSolicitacao);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
