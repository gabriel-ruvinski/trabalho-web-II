import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap, provideRouter, ActivatedRoute } from '@angular/router';
import { EfetuarOrcamento } from './efetuar-orcamento';

describe('EfetuarOrcamento', () => {
  let component: EfetuarOrcamento;
  let fixture: ComponentFixture<EfetuarOrcamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EfetuarOrcamento],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '0' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EfetuarOrcamento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
