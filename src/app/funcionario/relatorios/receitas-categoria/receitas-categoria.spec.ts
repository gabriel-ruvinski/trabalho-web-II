import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ReceitasCategoria } from './receitas-categoria';

describe('ReceitasCategoria', () => {
  let component: ReceitasCategoria;
  let fixture: ComponentFixture<ReceitasCategoria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceitasCategoria],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceitasCategoria);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
