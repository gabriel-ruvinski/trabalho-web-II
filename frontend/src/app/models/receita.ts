export interface ReceitaPorDia {
  data: Date;
  dataIso: string;
  valor: number;
}

export interface ReceitaPorCategoria {
  categoriaId: number;
  categoriaNome: string;
  valor: number;
}
