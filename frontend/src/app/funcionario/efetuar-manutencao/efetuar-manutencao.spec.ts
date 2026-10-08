import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap, provideRouter, ActivatedRoute } from '@angular/router';
import { EfetuarManutencao } from './efetuar-manutencao';

describe('EfetuarManutencao', () => {
  let component: EfetuarManutencao;
  let fixture: ComponentFixture<EfetuarManutencao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EfetuarManutencao],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '0' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EfetuarManutencao);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
