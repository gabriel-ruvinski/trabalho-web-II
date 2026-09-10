import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap, provideRouter, ActivatedRoute } from '@angular/router';
import { FinalizarSolicitacao } from './finalizar-solicitacao';

describe('FinalizarSolicitacao', () => {
  let component: FinalizarSolicitacao;
  let fixture: ComponentFixture<FinalizarSolicitacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalizarSolicitacao],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '0' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FinalizarSolicitacao);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
