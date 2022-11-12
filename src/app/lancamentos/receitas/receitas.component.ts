import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import * as moment from 'moment';
import Swal from 'sweetalert2';

import { MenuTypeEnum } from 'src/app/shared/emuns/menu-type.enum';
import { IReceita } from 'src/app/shared/models/receita.interface';
import { LancamentosService } from 'src/app/shared/services/lancamentos.service';
import { MenuService } from 'src/app/shared/services/menu.service';

@Component({
  selector: 'app-receitas',
  templateUrl: './receitas.component.html',
  styleUrls: ['./receitas.component.css']
})
export class ReceitasComponent implements OnInit {

  formulario!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private menuService: MenuService,
    private lancamentosService: LancamentosService
  ) { }

  get buttonLabel(): string {
    return this.lancamentosService.modoEdicao ? 'Editar' : 'Salvar';
  }

  get tipos(): string[] {
    return ['Alimentação','Transporte','Educação','Investimentos','Moradia'];
  }

  ngOnInit(): void {
    this.menuService.ondeEstou = MenuTypeEnum.LANCAMENTO_RECEITA;
    this.iniciarFormulario();
    this.verificarModoEdicao();
  }

  private verificarModoEdicao(): void {
    if (this.lancamentosService.modoEdicao) {
      const receita = this.lancamentosService.receitaSelecionada;
      this.loadReceita(receita);
    }
  }

  private iniciarFormulario(): void {
    const hoje = moment().format();
    this.formulario = this.formBuilder.group({
      tipo: ['', Validators.required],
      descricao: ['', Validators.required, Validators.minLength(5)],
      ehFixo: [false, [Validators.required]],
      data: [hoje, [Validators.required]],
      valor: ['', [Validators.required]]
    });
  }

  private loadFormulario(receita: IReceita): void {
    if (receita) {
      const valor = new Intl.NumberFormat('pt-BR', {minimumFractionDigits: 2}).format(receita.valor);
      this.formulario.patchValue({
        tipo: receita.tipo,
        descricao: receita.descricao,
        // ehFixo: despesa.ehFixo,
        data: receita.data,
        valor: valor
      });
    }
  }

  private loadReceita(receita: IReceita): void {
    this.lancamentosService.obterReceita(receita).subscribe({
      next: (resp) => {
        if (resp.status === HttpStatusCode.Ok) {
          const lancamento = resp.body;
          if (lancamento) {
            const receita: IReceita = {
              data: moment(lancamento.data).format(),
              descricao: lancamento.descricao,
              ehFixo: lancamento.ehFixo,
              tipo: lancamento.tipo,
              valor: lancamento.valor,
              id: lancamento.id
            };
            this.loadFormulario(receita);
          }
        }
      },
      error: (err: HttpErrorResponse) => {
        Swal.fire(
          'Ocorreu um erro ao carregar a Receita',
          err.error.mensagem,
          'warning'
          );
      }
    });
  }

  private save(receita: IReceita): void {
    this.lancamentosService.criarReceita(receita).subscribe({
      next: (resp) => {
        if (resp.status === HttpStatusCode.Ok || resp.status === HttpStatusCode.Created){
          // limpar o formulario
          this.formulario.reset();
          // mensagem
          Swal.fire(
            'Criar Receita',
            'Receita criada com sucesso!',
            'success'
            );
        }
      },
      error: (err: HttpErrorResponse) => {
        Swal.fire(
          'ALERTA: Criar Receita',
          err.error.mensagem,
          'warning'
          );
      }
    });
  }

  private update(receita: IReceita): void {
    this.lancamentosService.atualizarReceita(receita).subscribe({
      next: (resp) => {
        if (resp.status === HttpStatusCode.Ok){
          // limpar o formulario
          this.formulario.reset();
          // mensagem
          Swal.fire(
            'Atualizar Receita',
            'Receita atualizada com sucesso!',
            'success'
            );
        }
      },
      error: (err: HttpErrorResponse) => {
        Swal.fire(
          'ALERTA: Atualizar Receita',
          err.error.mensagem,
          'warning'
          );
      }
    });
  }

  onSalvar(): void {
    const receita: IReceita = this.formulario.value;
    // formatar o valor
    receita.valor = +(receita.valor.toString().replace('.','').replace(',','.'));
    // formatar a data
    receita.data = moment(receita.data).format('YYYY-MM-DD');
    if (this.lancamentosService.modoEdicao) {
      this.update(receita);
    } else {
      this.save(receita);
    }
  }

}
