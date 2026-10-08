/**
 * Tudo o que sair do ViaCEP, vai estar nesse formato.
 * Favor, não modificar nada aqui.
 */
export interface EnderecoViaCEP {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}