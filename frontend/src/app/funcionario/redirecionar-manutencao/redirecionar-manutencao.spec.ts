import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedirecionarManutencao } from './redirecionar-manutencao';

describe('RedirecionarManutencao', () => {
  let component: RedirecionarManutencao;
  let fixture: ComponentFixture<RedirecionarManutencao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedirecionarManutencao],
    }).compileComponents();

    fixture = TestBed.createComponent(RedirecionarManutencao);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
