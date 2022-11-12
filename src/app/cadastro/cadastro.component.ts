import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ICadastro } from '../shared/models/cadastro.interface';
import { CadastroService } from '../shared/services/cadastro.service';
import { UsuarioService } from '../shared/services/usuario.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent implements OnInit {

  formularioCadastro!: FormGroup;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService,
    private cadastroService: CadastroService
  ) { }

  ngOnInit(): void {
    this.iniciarFormulario();
  }

  private iniciarFormulario(): void {
    this.formularioCadastro = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(3)]],
      nome: ['', [Validators.required, Validators.minLength(5)]],
      telefone: ['', [Validators.required, Validators.minLength(14), Validators.pattern(/[0-9-()\s]/)]]
    });
  }

  private save(cadastro: ICadastro): void{
    this.cadastroService.criarUsuario(cadastro).subscribe({
      next: (resp) => {
        if (resp.status === HttpStatusCode.Ok || resp.status === HttpStatusCode.Created) {
          // this.router.navigate(['login']);
          Swal.fire(
            'Criar Usuário',
            'Usuário criado com sucesso!',
            'success'
            );
        }
      },
      error: (err: HttpErrorResponse) => {
        Swal.fire(
          'ALERTA: Criar Usuário',
          err.error.error,
          'warning'
          );
      }
    });
  }

  onSalvar(): void {
    const cadastro = this.formularioCadastro.value;
    cadastro.telefone = cadastro.telefone.replace(/[^0-9]/g, '');;
    this.save(cadastro);
    this.formularioCadastro.reset();
  }

  onCancelar(): void{
    this.router.navigate(['login']);
  }

}
