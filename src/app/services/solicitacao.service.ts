import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CategoriaService } from './categoria.service';
import { HistoricoSolicitacao } from '../models/historico-solicitacao';
import { Solicitacao } from '../models/solicitacao';
import { EstadoSolicitacao } from '../models/estado-solicitacao';
import { Funcionario } from '../models/funcionario';

export interface NovaSolicitacao {
  descricaoEquipamento: string;
  categoriaId: number;
  descricaoDefeito: string;
  clienteNome?: string;
  clienteCpf?: string;
  clienteEmail?: string;
  clienteTelefone?: string;
  clienteEndereco?: string;
}
export interface AcaoBotao {
  label: string;
  rota: string;
}
interface SolicitacaoJson {
  id: number;
  descricaoEquipamento: string;
  categoriaId: number;
  categoriaNome: string;
  descricaoDefeito: string;
  dataHoraAbertura: string;
  estado: Solicitacao['estado'];
  historico: Array<{
    dataHora: string;
    estado: HistoricoSolicitacao['estado'];
    funcionarioNome: string | null;
    observacao: string;
  }>;
  clienteNome?: string;
  clienteCpf?: string;
  clienteEmail?: string;
  clienteTelefone?: string;
  clienteEndereco?: string;
  valorOrcamento?: number | null;
  descricaoManutencao?: string | null;
  orientacoesCliente?: string | null;
  funcionarioDestinoId?: number | null;
  motivoRejeicao?: string | null;
  funcionariosEnvolvidosIds?: number[];
}

@Injectable({
  providedIn: 'root',
})
export class SolicitacaoService {
  private readonly storageKey = 'solicitacoes';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly categoriaService = inject(CategoriaService);

  listar(): Solicitacao[] {
    return this.carregar().sort(
      (a, b) => a.dataHoraAbertura.getTime() - b.dataHoraAbertura.getTime(),
    );
  }

  listarAbertas(): Solicitacao[] {
    return this.listar().filter((item) => item.estado === 'ABERTA');
  }

  listarPorCliente(email: string): Solicitacao[] {
    return this.listar().filter((item) => item.clienteEmail === email);
  }

  obterPorId(id: number): Solicitacao | undefined {
    return this.carregar().find((item) => item.id === id);
  }

  criar(dados: NovaSolicitacao): Solicitacao {

  const categoria = this.categoriaService.obterPorId(dados.categoriaId);

  if (!categoria) {

    throw new Error('Categoria inválida.');
  }
 

    const agora = new Date();
    const solicitacoes = this.carregar();
    const proximoId = solicitacoes.reduce((maior, item) => Math.max(maior, item.id), 0) + 1;

    const nova: Solicitacao = {
      id: proximoId,
      descricaoEquipamento: dados.descricaoEquipamento.trim(),
      categoriaId: categoria.id,
      categoriaNome: categoria.nome,
      descricaoDefeito: dados.descricaoDefeito.trim(),
      dataHoraAbertura: agora,
      estado: 'ABERTA',
      historico: [
        {
          dataHora: agora,
          estado: 'ABERTA',
          funcionarioNome: null,
          observacao: 'Solicitação registrada pelo cliente',
        },
      ],
      clienteNome: dados.clienteNome?.trim() || 'Cliente',
      clienteCpf: dados.clienteCpf?.trim() || '',
      clienteEmail: dados.clienteEmail?.trim() || '',
      clienteTelefone: dados.clienteTelefone?.trim() || '',
      clienteEndereco: dados.clienteEndereco?.trim() || '',
      valorOrcamento: null,
      descricaoManutencao: null,
      orientacoesCliente: null,
      funcionarioDestinoId: null,
    };

    solicitacoes.push(nova);
    this.salvar(solicitacoes);
    return nova;
  }

  efetuarOrcamento(id: number, valor: number, funcionarioNome: string): Solicitacao {
    if (!(valor > 0)) {
      throw new Error('Informe um valor de orçamento válido.');
    }

    return this.atualizar(id, 'ABERTA', (item, agora) => {
      item.valorOrcamento = valor;
      item.estado = 'ORCADA';
      item.historico.push({
        dataHora: agora,
        estado: 'ORCADA',
        funcionarioNome,
        observacao: `Orçamento de ${valor.toFixed(2)} registrado`,
      });
    });
  }

  efetuarManutencao(
    id: number,
    descricaoManutencao: string,
    orientacoesCliente: string,
    funcionarioNome: string,
  ): Solicitacao {
    return this.atualizar(id, ['APROVADA', 'REDIRECIONADA'], (item, agora) => {
      item.descricaoManutencao = descricaoManutencao.trim();
      item.orientacoesCliente = orientacoesCliente.trim();
      item.estado = 'ARRUMADA';
      item.historico.push({
        dataHora: agora,
        estado: 'ARRUMADA',
        funcionarioNome,
        observacao: 'Manutenção efetuada',
      });
    });
  }
  redirecionar(
  id: number,
  funcionarioDestino: Funcionario,
  funcionarioOrigemId: number,
  funcionarioOrigemNome: string,
): Solicitacao {
  return this.atualizar(id, ['APROVADA', 'REDIRECIONADA'], (item, agora) => {
    const envolvidos = new Set(item.funcionariosEnvolvidosIds ?? []);
    envolvidos.add(funcionarioOrigemId);
    envolvidos.add(funcionarioDestino.id);
    item.funcionariosEnvolvidosIds = Array.from(envolvidos);

    item.estado = 'REDIRECIONADA';
    item.funcionarioDestinoId = funcionarioDestino.id;
    item.historico.push({
      dataHora: agora,
      estado: 'REDIRECIONADA',
      funcionarioNome: funcionarioOrigemNome,
      observacao: `Redirecionado para ${funcionarioDestino.nome}.`,
    });
  });
}
  finalizar(id: number, funcionarioNome: string): Solicitacao {
    return this.atualizar(id, 'PAGA', (item, agora) => {
      item.estado = 'FINALIZADA';
      item.historico.push({
        dataHora: agora,
        estado: 'FINALIZADA',
        funcionarioNome,
        observacao: 'Solicitação finalizada',
      });
    });
  }

  private atualizar(
    id: number,
    estadosPermitidos: EstadoSolicitacao | EstadoSolicitacao[],
    mutar: (item: Solicitacao, agora: Date) => void,
  ): Solicitacao {
    const permitidos = Array.isArray(estadosPermitidos) ? estadosPermitidos : [estadosPermitidos];
    const solicitacoes = this.carregar();
    const item = solicitacoes.find((solicitacao) => solicitacao.id === id);
    if (!item) {
      throw new Error('Solicitação não encontrada.');
    }
    if (!permitidos.includes(item.estado)) {
      throw new Error('A solicitação não está no estado permitido para esta ação.');
    }

    const agora = new Date();
    mutar(item, agora);
    this.salvar(solicitacoes);
    return item;
  }

  private carregar(): Solicitacao[] {
    if (!this.isBrowser) {
      return [];
    }

    const bruto = localStorage.getItem(this.storageKey);
    if (!bruto) {
      const iniciais = this.dadosIniciais();
      this.salvar(iniciais);
      return iniciais;
    }

    try {
      const lista = JSON.parse(bruto) as SolicitacaoJson[];
      const hidratada = lista.map((item) => this.hidratar(item));
      const ids = new Set(hidratada.map((item) => item.id));
      let alterou = false;
      for (const demo of this.dadosIniciais()) {
        if (!ids.has(demo.id)) {
          hidratada.push(demo);
          alterou = true;
        }
      }
      if (alterou) {
        this.salvar(hidratada);
      }
      return hidratada;
    } catch {
      return [];
    }
  }

  private hidratar(item: SolicitacaoJson): Solicitacao {
  return {
    id: item.id,
    descricaoEquipamento: item.descricaoEquipamento,
    categoriaId: item.categoriaId,
    categoriaNome: item.categoriaNome,
    descricaoDefeito: item.descricaoDefeito,
    dataHoraAbertura: new Date(item.dataHoraAbertura),
    estado: item.estado,
    historico: (item.historico ?? []).map((passo) => ({
      ...passo,
      dataHora: new Date(passo.dataHora),
    })),
    clienteNome: item.clienteNome ?? 'Cliente',
    clienteCpf: item.clienteCpf ?? '',
    clienteEmail: item.clienteEmail ?? '',
    clienteTelefone: item.clienteTelefone ?? '',
    clienteEndereco: item.clienteEndereco ?? '',
    valorOrcamento: item.valorOrcamento ?? null,
    descricaoManutencao: item.descricaoManutencao ?? null,
    orientacoesCliente: item.orientacoesCliente ?? null,
    funcionarioDestinoId: item.funcionarioDestinoId ?? null,
    motivoRejeicao: item.motivoRejeicao ?? null,
    funcionariosEnvolvidosIds: item.funcionariosEnvolvidosIds ?? [],
  };
}

  private dadosIniciais(): Solicitacao[] {
    const passo = (
      data: string,
      estado: EstadoSolicitacao,
      funcionarioNome: string | null,
      observacao: string,
    ): HistoricoSolicitacao => ({
      dataHora: new Date(data),
      estado,
      funcionarioNome,
      observacao,
    });

    return [
      {
        id: 101,
        descricaoEquipamento: 'Notebook Dell Inspiron',
        categoriaId: 1,
        categoriaNome: 'Notebook',
        descricaoDefeito: 'Não liga após queda',
        dataHoraAbertura: new Date('2026-09-09T10:30:00'),
        estado: 'ABERTA',
        historico: [passo('2026-09-09T10:30:00', 'ABERTA', null, 'Solicitação registrada pelo cliente')],
        clienteNome: 'João da Silva',
        clienteCpf: '123.456.789-00',
        clienteEmail: 'joao@email.com',
        clienteTelefone: '(41) 99999-0001',
        clienteEndereco: 'Rua das Flores, 100 - Curitiba/PR',
        valorOrcamento: null,
        descricaoManutencao: null,
        orientacoesCliente: null,
        funcionarioDestinoId: null,
      },
      {
        id: 102,
        descricaoEquipamento: 'Desktop escritório',
        categoriaId: 2,
        categoriaNome: 'Desktop',
        descricaoDefeito: 'Tela azul frequente',
        dataHoraAbertura: new Date('2026-09-09T09:15:00'),
        estado: 'ORCADA',
        historico: [
          passo('2026-09-09T09:15:00', 'ABERTA', null, 'Solicitação registrada pelo cliente'),
          passo('2026-09-09T11:00:00', 'ORCADA', 'Maria', 'Orçamento registrado'),
        ],
        clienteNome: 'Maria Souza',
        clienteCpf: '987.654.321-00',
        clienteEmail: 'maria.souza@email.com',
        clienteTelefone: '(41) 99999-0002',
        clienteEndereco: 'Av. Brasil, 200 - Curitiba/PR',
        valorOrcamento: 350,
        descricaoManutencao: null,
        orientacoesCliente: null,
        funcionarioDestinoId: null,
      },
      {
        id: 103,
        descricaoEquipamento: 'Impressora HP',
        categoriaId: 3,
        categoriaNome: 'Impressora',
        descricaoDefeito: 'Não puxa papel',
        dataHoraAbertura: new Date('2026-09-08T15:40:00'),
        estado: 'APROVADA',
        historico: [
          passo('2026-09-08T15:40:00', 'ABERTA', null, 'Solicitação registrada pelo cliente'),
          passo('2026-09-08T16:10:00', 'ORCADA', 'Mário', 'Orçamento registrado'),
          passo('2026-09-08T17:00:00', 'APROVADA', null, 'Cliente aprovou o serviço'),
        ],
        clienteNome: 'Carlos Oliveira',
        clienteCpf: '111.222.333-44',
        clienteEmail: 'carlos@email.com',
        clienteTelefone: '(41) 99999-0003',
        clienteEndereco: 'Rua XV, 50 - Curitiba/PR',
        valorOrcamento: 120,
        descricaoManutencao: null,
        orientacoesCliente: null,
        funcionarioDestinoId: null,
      },
      {
        id: 104,
        descricaoEquipamento: 'Mouse sem fio',
        categoriaId: 4,
        categoriaNome: 'Mouse',
        descricaoDefeito: 'Scroll travando',
        dataHoraAbertura: new Date('2026-09-08T11:20:00'),
        estado: 'REDIRECIONADA',
        historico: [
          passo('2026-09-08T11:20:00', 'ABERTA', null, 'Solicitação registrada pelo cliente'),
          passo('2026-09-08T12:00:00', 'ORCADA', 'Maria', 'Orçamento registrado'),
          passo('2026-09-08T13:00:00', 'APROVADA', null, 'Cliente aprovou o serviço'),
          passo('2026-09-08T14:00:00', 'REDIRECIONADA', 'Maria', 'Redirecionada para Mário'),
        ],
        clienteNome: 'Ana Costa',
        clienteCpf: '222.333.444-55',
        clienteEmail: 'ana@email.com',
        clienteTelefone: '(41) 99999-0004',
        clienteEndereco: 'Rua Chile, 80 - Curitiba/PR',
        valorOrcamento: 80,
        descricaoManutencao: null,
        orientacoesCliente: null,
        funcionarioDestinoId: 1,
      },
      {
        id: 105,
        descricaoEquipamento: 'Teclado mecânico',
        categoriaId: 5,
        categoriaNome: 'Teclado',
        descricaoDefeito: 'Teclas sem resposta',
        dataHoraAbertura: new Date('2026-09-07T14:10:00'),
        estado: 'PAGA',
        historico: [
          passo('2026-09-07T14:10:00', 'ABERTA', null, 'Solicitação registrada pelo cliente'),
          passo('2026-09-07T15:00:00', 'ORCADA', 'Mário', 'Orçamento registrado'),
          passo('2026-09-07T16:00:00', 'APROVADA', null, 'Cliente aprovou o serviço'),
          passo('2026-09-07T18:00:00', 'ARRUMADA', 'Mário', 'Manutenção efetuada'),
          passo('2026-09-08T09:00:00', 'PAGA', null, 'Pagamento confirmado'),
        ],
        clienteNome: 'Pedro Santos',
        clienteCpf: '333.444.555-66',
        clienteEmail: 'pedro@email.com',
        clienteTelefone: '(41) 99999-0005',
        clienteEndereco: 'Rua Padilha, 12 - Curitiba/PR',
        valorOrcamento: 200,
        descricaoManutencao: 'Substituição do circuito das teclas',
        orientacoesCliente: 'Evitar líquidos sobre o teclado',
        funcionarioDestinoId: null,
      },
      {
        id: 106,
        descricaoEquipamento: 'Notebook Lenovo',
        categoriaId: 1,
        categoriaNome: 'Notebook',
        descricaoDefeito: 'Superquente',
        dataHoraAbertura: new Date('2026-09-05T09:00:00'),
        estado: 'FINALIZADA',
        historico: [
          passo('2026-09-05T09:00:00', 'ABERTA', null, 'Solicitação registrada pelo cliente'),
          passo('2026-09-05T10:00:00', 'ORCADA', 'Maria', 'Orçamento registrado'),
          passo('2026-09-05T11:00:00', 'APROVADA', null, 'Cliente aprovou o serviço'),
          passo('2026-09-05T16:00:00', 'ARRUMADA', 'Maria', 'Manutenção efetuada'),
          passo('2026-09-06T10:00:00', 'PAGA', null, 'Pagamento confirmado'),
          passo('2026-09-06T14:00:00', 'FINALIZADA', 'Maria', 'Solicitação finalizada'),
        ],
        clienteNome: 'Joana Lima',
        clienteCpf: '444.555.666-77',
        clienteEmail: 'joana@email.com',
        clienteTelefone: '(41) 99999-0006',
        clienteEndereco: 'Rua das Araucárias, 10 - Curitiba/PR',
        valorOrcamento: 450,
        descricaoManutencao: 'Troca da pasta térmica',
        orientacoesCliente: 'Usar em superfície plana',
        funcionarioDestinoId: null,
      },
      {
        id: 107,
        descricaoEquipamento: 'Impressora Epson',
        categoriaId: 3,
        categoriaNome: 'Impressora',
        descricaoDefeito: 'Manchas na folha',
        dataHoraAbertura: new Date('2026-09-07T08:00:00'),
        estado: 'PAGA',
        historico: [
          passo('2026-09-07T08:00:00', 'ABERTA', null, 'Solicitação registrada pelo cliente'),
          passo('2026-09-07T09:00:00', 'ORCADA', 'Mário', 'Orçamento registrado'),
          passo('2026-09-07T10:00:00', 'APROVADA', null, 'Cliente aprovou o serviço'),
          passo('2026-09-07T17:00:00', 'ARRUMADA', 'Mário', 'Manutenção efetuada'),
          passo('2026-09-08T11:30:00', 'PAGA', null, 'Pagamento confirmado'),
        ],
        clienteNome: 'José Almeida',
        clienteCpf: '555.666.777-88',
        clienteEmail: 'jose@email.com',
        clienteTelefone: '(41) 99999-0007',
        clienteEndereco: 'Rua Marechal, 22 - Curitiba/PR',
        valorOrcamento: 180,
        descricaoManutencao: 'Limpeza do cabeçote',
        orientacoesCliente: 'Usar papel indicado',
        funcionarioDestinoId: null,
      },
      {
        id: 108,
        descricaoEquipamento: 'Desktop gamer',
        categoriaId: 2,
        categoriaNome: 'Desktop',
        descricaoDefeito: 'Não reconhece SSD',
        dataHoraAbertura: new Date('2026-09-09T08:30:00'),
        estado: 'FINALIZADA',
        historico: [
          passo('2026-09-09T08:30:00', 'ABERTA', null, 'Solicitação registrada pelo cliente'),
          passo('2026-09-09T09:30:00', 'ORCADA', 'Maria', 'Orçamento registrado'),
          passo('2026-09-09T10:00:00', 'APROVADA', null, 'Cliente aprovou o serviço'),
          passo('2026-09-09T18:00:00', 'ARRUMADA', 'Maria', 'Manutenção efetuada'),
          passo('2026-09-10T09:15:00', 'PAGA', null, 'Pagamento confirmado'),
          passo('2026-09-10T11:00:00', 'FINALIZADA', 'Mário', 'Solicitação finalizada'),
        ],
        clienteNome: 'Joaquina Dias',
        clienteCpf: '666.777.888-99',
        clienteEmail: 'joaquina@email.com',
        clienteTelefone: '(41) 99999-0008',
        clienteEndereco: 'Av. Sete de Setembro, 900 - Curitiba/PR',
        valorOrcamento: 900,
        descricaoManutencao: 'Reinstalação do SSD',
        orientacoesCliente: 'Não mover o gabinete ligado',
        funcionarioDestinoId: null,
      },
    ];
  }
  getAcaoBotao(solicitacao: Solicitacao): AcaoBotao | null {
    switch (solicitacao.estado) {
      case 'ORCADA':
        return { label: 'Aprovar/Rejeitar Serviço', rota: `/orcamento/${solicitacao.id}` };
      case 'APROVADA':
        return null; // sem botão de ação
      case 'REJEITADA':
        return { label: 'Resgatar Serviço', rota: `/resgatar-servico/${solicitacao.id}` };
      case 'ARRUMADA':
        return { label: 'Pagar Serviço', rota: `/pagar-servico/${solicitacao.id}` };
      default:
        return null;
    }
  }
  private salvar(solicitacoes: Solicitacao[]): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(solicitacoes));
  }

  aprovar(id: number): Solicitacao {
    return this.atualizar(id, 'ORCADA', (item, agora) => {
      item.estado = 'APROVADA';
      item.historico.push({
        dataHora: agora,
        estado: 'APROVADA',
        funcionarioNome: null,
        observacao: 'Cliente aprovou o serviço',
      });
    });
  }

  rejeitar(id: number, motivo: string): Solicitacao {
    return this.atualizar(id, 'ORCADA', (item, agora) => {
      item.estado = 'REJEITADA';
      item.motivoRejeicao = motivo;
      item.historico.push({
        dataHora: agora,
        estado: 'REJEITADA',
        funcionarioNome: null,
        observacao: motivo,
      });
    });
  }

  pagar(id: number): Solicitacao {
    return this.atualizar(id, 'ARRUMADA', (item, agora) => {
      item.estado = 'PAGA';
      item.historico.push({
        dataHora: agora,
        estado: 'PAGA',
        funcionarioNome: null,
        observacao: 'Pagamento confirmado pelo cliente',
      });
    });
  }

  resgatar(id: number): Solicitacao {
    return this.atualizar(id, 'REJEITADA', (item, agora) => {
      item.estado = 'APROVADA';
      item.historico.push({
        dataHora: agora,
        estado: 'APROVADA',
        funcionarioNome: null,
        observacao: 'Cliente resgatou o serviço, voltando de rejeitada para aprovada',
      });
    });
  }
}

