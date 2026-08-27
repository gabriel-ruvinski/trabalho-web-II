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
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
