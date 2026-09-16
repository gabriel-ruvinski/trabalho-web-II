import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResgatarServico } from './resgatar-servico';

describe('ResgatarServico', () => {
  let component: ResgatarServico;
  let fixture: ComponentFixture<ResgatarServico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResgatarServico],
    }).compileComponents();

    fixture = TestBed.createComponent(ResgatarServico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
