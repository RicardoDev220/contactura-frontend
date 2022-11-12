import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/app-state';
import { AppSettings } from 'src/app/app.settings';
import { ICadastro } from '../models/cadastro.interface';
import { DaoService } from './dao.service';

@Injectable({
  providedIn: 'root'
})
export class CadastroService {

  constructor(
    private dao: DaoService,
    private state: AppState
  ) { }

  /**
   * Cadastra um usuario
   * @param cadastro dados do usuario
   * @returns retorna objeto usuario criada
   */
  criarUsuario(cadastro: ICadastro): Observable<HttpResponse<ICadastro>> {
    return this.dao.post<ICadastro>(AppSettings.API_USUARIO,
       cadastro, DaoService.MEDIA_TYPE_APP_JSON);
  }
}
