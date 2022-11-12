import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { MenuTypeEnum } from 'src/app/shared/emuns/menu-type.enum';
import { IReceita } from 'src/app/shared/models/receita.interface';
import { LancamentosService } from 'src/app/shared/services/lancamentos.service';
import { MenuService } from 'src/app/shared/services/menu.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-receitas',
  templateUrl: './receitas.component.html',
  styleUrls: ['./receitas.component.css']
})
export class ReceitasComponent implements OnInit {

  formulario!: FormGroup;
  dataSourceReceitas: IReceita[] = [];
  dataSourceReceitas2: IReceita[] = [];
  displayedColumns = ['data','valor','tipo','fixo','descricao','acoes'];

  constructor(
    private router: Router,
    private menuService: MenuService,
    private formBuilder: FormBuilder,
    private lancamentosService: LancamentosService
  ) { }

  ngOnInit(): void {
    this.lastReceitas();
    this.menuService.ondeEstou = MenuTypeEnum.RELATORIO_RECEITA;
    this.iniciarFormulario();
  }

  private iniciarFormulario(): void {
    const hoje = moment().format();
    this.formulario = this.formBuilder.group({
      inicio: [hoje],
      fim: [hoje]
    });
  }

  private lastReceitas(): void {
    this.lancamentosService.listaReceitas().subscribe({
      next: (resp) => {
        if(resp.status === HttpStatusCode.Ok) {
          const lancamentos = resp.body;
          if (lancamentos && lancamentos.length > 0) {
            this.dataSourceReceitas = lancamentos
              // filtrar as receitas
              .filter(l => l.ehReceita === true)
              // transforma o lancamento em receita
              .map( lancamento => {
                const receita: IReceita = {
                  data: lancamento.data,
                  descricao: lancamento.descricao,
                  ehFixo: lancamento.ehFixo,
                  tipo: lancamento.tipo,
                  valor: lancamento.valor,
                  id: lancamento.id
                };
                return receita;
              });
            this.dataSourceReceitas2 = this.dataSourceReceitas;
          }
        }
      }
    });
  }

  private removeReceita(receita: IReceita): void {
    this.lancamentosService.removerReceita(receita).subscribe({
      next: (resp) => {
        if (resp.status === HttpStatusCode.Ok) {
          // atualizar a listagem
          this.lastReceitas();
          // mensagem
          Swal.fire(
            'Removido!',
            'Receita removida com sucesso.',
            'success'
            );
        }
      },
      error: (err: HttpErrorResponse) => {
        if (err.status < 500) {
          Swal.fire(
            'Erro ao remover a Receita',
            err.error.mensagem,
            'warning'
            );
        } else {
          Swal.fire(
            'Erro inespesado',
            err.error.mensagem,
            'error'
            );
        }
      }
    });
  }

  onEditReceita(receita: IReceita) {
    this.lancamentosService.receitaSelecionada = receita;
    this.lancamentosService.modoEdicao = true;
    this.router.navigate(['lancamentos/receitas']);
  }

  onRemoveReceita(receita: IReceita) {
    Swal.fire({
      title: 'Remover Receita',
      text: 'Deseja remover a receita "' + receita.descricao.toUpperCase() + '" ?',
      icon: 'question',
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não',
      showCancelButton: true,
      focusConfirm: false,
    }).then((result) => {
      // Se confirmar remover
      if (result.isConfirmed) {
        this.removeReceita(receita);
      }
    });
  }

  onPesquisar(): void{
    const periodo: any = this.formulario.value;
    periodo.inicio = moment(periodo.inicio).format('YYYY-MM-DD');
    periodo.fim = moment(periodo.fim).format('YYYY-MM-DD');

    this.dataSourceReceitas = this.dataSourceReceitas2
      .filter(lancamento => moment(lancamento.data).isSameOrAfter(periodo.inicio) &&
      moment(lancamento.data).isSameOrBefore(periodo.fim));
  }

}
