import { Directive, HostListener } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
  selector: '[appApenasLetras]',
  standalone: true
})
export class ApenasLetrasDirective {

  @HostListener('input')
  validar(): void {
    const valor = this.ngModel.control.value;

    if (!valor) {
      this.ngModel.control.setErrors(null);
      return;
    }

    const valido = /^[a-zA-ZÀ-ÿ\s]+$/.test(valor);

    if (!valido) {
      this.ngModel.control.setErrors({
        apenasLetras: true
      });
    } else {
      this.ngModel.control.setErrors(null);
    }
  }

  constructor(private ngModel: NgModel) {}
}
