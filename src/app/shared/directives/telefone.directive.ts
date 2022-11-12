import { Directive, ElementRef, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appTelefone]'
})
export class TelefoneDirective {

  public nativeElement: HTMLInputElement;

  constructor(public elementRef: ElementRef) {
    this.nativeElement = elementRef.nativeElement;
  }
  
  @HostListener('input',['$event'])
  onKeyDown(event: any){
    let numeros = this.nativeElement.value.replace(/[^0-9]/g, '');

    const pattern = /[0-9\-]/;
    const ultimoCaractere = this.nativeElement.value.slice(-1);
    const terminaComNumeroOuTraco = pattern.test(ultimoCaractere);

    if (event.inputType == "deleteContentBackward" && !terminaComNumeroOuTraco){
      numeros = numeros.slice(0,-1);
    }

    //separa os numeros nos seus campos
    let campos = [];
    campos[0] = (numeros.substring(0,2));
    campos[1] = (numeros.substring(2,7));
    campos[2] = (numeros.substring(7,11));
    
    //aplica a mascara
    if (!campos[0]) this.nativeElement.value = `(__) _____-____`;
    if (campos[0]) this.nativeElement.value = `(${campos[0]}) _____-____`;
    if (campos[1]) this.nativeElement.value = `(${campos[0]}) ${campos[1]}-____`;
    if (campos[2]) this.nativeElement.value = `(${campos[0]}) ${campos[1]}-${campos[2]}`;
  }
}
