import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { MenuTypeEnum } from 'src/app/shared/emuns/menu-type.enum';
import { IDespesa } from 'src/app/shared/models/despesa.interface';
import { LancamentosService } from 'src/app/shared/services/lancamentos.service';
import { MenuService } from 'src/app/shared/services/menu.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-despesas',
  templateUrl: './despesas.component.html',
  styleUrls: ['./despesas.component.css']
})
export class DespesasComponent implements OnInit {

  formulario!: FormGroup;
  dataSourceDespesas: IDespesa[] = [];
  dataSourceDespesas2: IDespesa[] = [];
  displayedColumns = ['data','valor','tipo','fixo','descricao','acoes'];

  constructor(
    private router: Router,
    private menuService: MenuService,
    private formBuilder: FormBuilder,
    private lancamentosService: LancamentosService
  ) { }

  ngOnInit(): void {
    this.lastDespesas();
    this.menuService.ondeEstou = MenuTypeEnum.RELATORIO_DESPESA;
    this.iniciarFormulario();
  }

  private iniciarFormulario(): void {
    const hoje = moment().format();
    this.formulario = this.formBuilder.group({
      inicio: [hoje],
      fim: [hoje]
    });
  }

  private lastDespesas(): void {
    this.lancamentosService.listaDespesas().subscribe({
      next: (resp) => {
        if(resp.status === HttpStatusCode.Ok) {
          const lancamentos = resp.body;
          if (lancamentos && lancamentos.length > 0) {
            this.dataSourceDespesas = lancamentos
              // filtrar as despesas
              .filter(l => l.ehReceita === false)
              // transforma o lancamento em despesa
              .map( lancamento => {
                const despesa: IDespesa = {
                  data: lancamento.data,
                  descricao: lancamento.descricao,
                  ehFixo: lancamento.ehFixo,
                  tipo: lancamento.tipo,
                  valor: lancamento.valor,
                  id: lancamento.id
                };
                return despesa;
              });
            this.dataSourceDespesas2 = this.dataSourceDespesas;
          }
        }
      }
    });
  }

  private removeDespesa(despesa: IDespesa): void {
    this.lancamentosService.removerDespesa(despesa).subscribe({
      next: (resp) => {
        if (resp.status === HttpStatusCode.Ok) {
          // atualizar a listagem
          this.lastDespesas();
          // mensagem
          Swal.fire(
            'Removido!',
            'Despesa removido com sucesso.',
            'success'
            );
        }
      },
      error: (err: HttpErrorResponse) => {
        if (err.status < 500) {
          Swal.fire(
            'Erro ao remover a Despesa',
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

  onEditDespesa(despesa: IDespesa) {
    this.lancamentosService.despesaSelecionada = despesa;
    this.lancamentosService.modoEdicao = true;
    this.router.navigate(['lancamentos/despesas']);
  }

  onRemoveDespesa(despesa: IDespesa) {
    Swal.fire({
      title: 'Remover Despesa',
      text: 'Deseja remover a despesa "' + despesa.descricao.toUpperCase() + '" ?',
      icon: 'question',
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não',
      showCancelButton: true,
      focusConfirm: false,
    }).then((result) => {
      // Se confirmar remover
      if (result.isConfirmed) {
        this.removeDespesa(despesa);
      }
    });
  }

  onPesquisar(): void{
    const periodo: any = this.formulario.value;
    periodo.inicio = moment(periodo.inicio).format('YYYY-MM-DD');
    periodo.fim = moment(periodo.fim).format('YYYY-MM-DD');

    this.dataSourceDespesas = this.dataSourceDespesas2
      .filter(lancamento => moment(lancamento.data).isSameOrAfter(periodo.inicio) &&
      moment(lancamento.data).isSameOrBefore(periodo.fim));
  }

}
