import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { EstadoSolicitacao } from '../models/estado-solicitacao';
import { Solicitacao } from '../models/solicitacao';
import { AuthService } from '../auth/services/auth.service';

export interface AcaoBotao {
  label: string;
  rota: string;
}

interface HistoricoApi {
  estadoAnteriorId: number | null;
  estadoNovoId: number;
  dataHora: string;
  usuarioId: number | null;
  funcionarioDestinoId: number | null;
  observacao: string | null;
  funcionarioNome: string | null;
}

interface SolicitacaoApi {
  id: number;
  clienteId: number;
  categoriaId: number;
  categoriaNome: string;
  estadoId: number;
  descricaoEquipamento: string;
  descricaoDefeito: string;
  dataHoraAbertura: string;
  valorOrcado: number | null;
  funcionarioDestinoId: number | null;
  descricaoManutencao: string | null;
  orientacoesCliente: string | null;
  motivoRejeicao: string | null;
  historico: HistoricoApi[];
  funcionarioResponsavelId: number | null;
  funcionarioResponsavelNome: string | null;
}

interface ClienteApi {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
}

const ESTADO_POR_ID: Record<number, EstadoSolicitacao> = {
  1: 'ABERTA',
  2: 'ORCADA',
  3: 'REJEITADA',
  4: 'APROVADA',
  5: 'REDIRECIONADA',
  6: 'ARRUMADA',
  7: 'PAGA',
  8: 'FINALIZADA',
};

@Injectable({
  providedIn: 'root',
})
export class SolicitacaoApiService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:8080/api/solicitacoes';
  private readonly clientesUrl = 'http://localhost:8080/api/clientes';

  listarParaFuncionario(solicitanteId: number): Observable<Solicitacao[]> {
    const params = new HttpParams()
      .set('solicitanteId', solicitanteId)
      .set('filtro', 'TODAS');

    return this.comClientes(
      this.http.get<SolicitacaoApi[]>(this.apiUrl, { params }),
    );
  }

  listarAbertas(solicitanteId: number): Observable<Solicitacao[]> {
    const params = new HttpParams().set('solicitanteId', solicitanteId);

    return this.comClientes(
      this.http.get<SolicitacaoApi[]>(`${this.apiUrl}/abertas`, { params }),
    );
  }

  listarDoCliente(clienteId: number): Observable<Solicitacao[]> {
    const params = new HttpParams().set('solicitanteId', clienteId);

    return this.http
      .get<SolicitacaoApi[]>(`${this.apiUrl}/cliente/${clienteId}`, { params })
      .pipe(map((lista) => lista.map((s) => this.paraModelo(s))));
  }

  abrir(
    solicitanteId: number,
    categoriaId: number,
    descricaoEquipamento: string,
    descricaoDefeito: string,
  ): Observable<Solicitacao> {
    const params = new HttpParams().set('solicitanteId', solicitanteId);

    return this.http
      .post<SolicitacaoApi>(
        this.apiUrl,
        { categoriaId, descricaoEquipamento, descricaoDefeito },
        { params },
      )
      .pipe(map((s) => this.paraModelo(s)));
  }

  private comClientes(
    solicitacoes$: Observable<SolicitacaoApi[]>,
  ): Observable<Solicitacao[]> {
    return forkJoin({
      solicitacoes: solicitacoes$,
      clientes: this.http.get<ClienteApi[]>(this.clientesUrl),
    }).pipe(
      map(({ solicitacoes, clientes }) => {
        const porId = new Map(clientes.map((c) => [c.id, c]));

        return solicitacoes.map((s) =>
          this.paraModelo(s, porId.get(s.clienteId)),
        );
      }),
    );
  }

    obterPorId(id: number, solicitanteId: number): Observable<Solicitacao> {
    const params = new HttpParams().set('solicitanteId', solicitanteId);

    return this.http
      .get<SolicitacaoApi>(`${this.apiUrl}/${id}`, { params })
      .pipe(
        switchMap((s) =>
          this.http.get<ClienteApi>(`${this.clientesUrl}/${s.clienteId}`).pipe(
            map((cliente) => this.paraModelo(s, cliente)),
            // Cliente inativo/inexistente não pode impedir a tela de abrir.
            catchError(() => of(this.paraModelo(s))),
          ),
        ),
      );
  }

  registrarOrcamento(
    id: number,
    valor: number,
    funcionarioId: number,
  ): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/orcamento`, {
      valor,
      funcionarioId,
    });
  }

  registrarManutencao(
    id: number,
    funcionarioId: number,
    descricao: string,
    orientacoes: string,
  ): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/manutencao`, {
      funcionarioId,
      descricao,
      orientacoes,
    });
  }

  redirecionar(
    id: number,
    funcionarioAtualId: number,
    funcionarioDestinoId: number,
  ): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/redirecionar`, {
      funcionarioAtualId,
      funcionarioDestinoId,
    });
  }

  finalizar(id: number, usuarioId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/finalizar`, {
      usuarioId,
    });
  }

    private paraModelo(s: SolicitacaoApi, cliente?: ClienteApi): Solicitacao {
    const historico = s.historico ?? [];

    const envolvidos = new Set<number>();
    for (const h of historico) {
      if (h.usuarioId != null) {
        envolvidos.add(h.usuarioId);
      }
      if (h.funcionarioDestinoId != null) {
        envolvidos.add(h.funcionarioDestinoId);
      }
    }

    return {
      id: s.id,
      descricaoEquipamento: s.descricaoEquipamento,
      categoriaId: s.categoriaId,
      categoriaNome: s.categoriaNome,
      descricaoDefeito: s.descricaoDefeito,
      dataHoraAbertura: new Date(s.dataHoraAbertura),
      estado: ESTADO_POR_ID[s.estadoId] ?? 'ABERTA',
      historico: historico.map((h) => ({
        dataHora: new Date(h.dataHora),
        estado: ESTADO_POR_ID[h.estadoNovoId] ?? 'ABERTA',
        funcionarioNome: h.funcionarioNome ?? null,
        observacao: h.observacao ?? '',
      })),
      clienteNome: cliente?.nome ?? `Cliente #${s.clienteId}`,
      clienteCpf: cliente?.cpf ?? '',
      clienteEmail: cliente?.email ?? '',
      clienteTelefone: cliente?.telefone ?? '',
      clienteEndereco: cliente
        ? `${cliente.logradouro}, ${cliente.numero}${cliente.complemento ? ' - ' + cliente.complemento : ''} - ${cliente.bairro}, ${cliente.cidade}/${cliente.uf}`
        : '',
      valorOrcamento: s.valorOrcado ?? null,
      descricaoManutencao: s.descricaoManutencao ?? null,
      orientacoesCliente: s.orientacoesCliente ?? null,
      funcionarioDestinoId: s.funcionarioDestinoId ?? null,
      motivoRejeicao: s.motivoRejeicao ?? null,
      funcionariosEnvolvidosIds: [...envolvidos],
      funcionarioResponsavelId: s.funcionarioResponsavelId ?? null,
      funcionarioResponsavelNome: s.funcionarioResponsavelNome ?? null,
    };
  }
  aprovarOrcamento(id: number, usuarioId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/aprovar-orcamento`, {
      usuarioId,
    });
  }

  rejeitarOrcamento(
    id: number,
    usuarioId: number,
    motivo: string,
  ): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/rejeitar-orcamento`, {
      usuarioId,
      motivo,
    });
  }

  resgatar(id: number, usuarioId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/resgatar`, {
      usuarioId,
    });
  }

  pagar(id: number, usuarioId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/pagamento`, {
      usuarioId,
    });
  }

  getAcaoBotao(solicitacao: Solicitacao): AcaoBotao | null {
    switch (solicitacao.estado) {
      case 'ORCADA':
        return { label: 'Aprovar/Rejeitar Serviço', rota: `/orcamento/${solicitacao.id}` };
      case 'REJEITADA':
        return { label: 'Resgatar Serviço', rota: `/resgatar-servico/${solicitacao.id}` };
      case 'ARRUMADA':
        return { label: 'Pagar Serviço', rota: `/pagar-servico/${solicitacao.id}` };
      default:
        return null;
    }
  }
}