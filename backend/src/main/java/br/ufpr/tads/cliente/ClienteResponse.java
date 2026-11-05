package br.ufpr.tads.cliente;

public record ClienteResponse(
        Integer id,
        String nome,
        String email,
        String cpf,
        String telefone,
        String cep,
        String logradouro,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String uf
) {
    public static ClienteResponse de(Cliente c) {
        return new ClienteResponse(
                c.getUsuarioId(),
                c.getUsuario().getNome(),
                c.getUsuario().getEmail(),
                c.getCpf(),
                c.getTelefone(),
                c.getCep(),
                c.getLogradouro(),
                c.getNumero(),
                c.getComplemento(),
                c.getBairro(),
                c.getCidade(),
                c.getUf());
    }
}