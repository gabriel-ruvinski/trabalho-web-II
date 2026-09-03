export interface Usuario {
     nome:string;
     senha:string;  
     email:string;
     cpf:string;
     telefone:string;
     cep:string;
     autenticado:boolean;
     perfil : 'cliente' | 'funcionario';
   }