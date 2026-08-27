import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SolicitarManutencao } from './solicitar-manutencao';

describe('SolicitarManutencao', () => {
  let component: SolicitarManutencao;
  let fixture: ComponentFixture<SolicitarManutencao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitarManutencao],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitarManutencao);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
