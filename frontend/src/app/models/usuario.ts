export interface Usuario {
  nome: string;
  senha: string;
  email: string;
  cpf: string;
  telefone: string;
  cep: string;
  autenticado: boolean;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  perfil: 'cliente' | 'funcionario';
}