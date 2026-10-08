import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MostrarOrcamento } from './mostrar-orcamento';

describe('MostrarOrcamento', () => {
  let component: MostrarOrcamento;
  let fixture: ComponentFixture<MostrarOrcamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MostrarOrcamento],
    }).compileComponents();

    fixture = TestBed.createComponent(MostrarOrcamento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
