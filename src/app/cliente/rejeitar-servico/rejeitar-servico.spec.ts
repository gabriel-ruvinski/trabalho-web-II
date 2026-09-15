import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejeitarServico } from './rejeitar-servico';

describe('RejeitarServico', () => {
  let component: RejeitarServico;
  let fixture: ComponentFixture<RejeitarServico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejeitarServico],
    }).compileComponents();

    fixture = TestBed.createComponent(RejeitarServico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
