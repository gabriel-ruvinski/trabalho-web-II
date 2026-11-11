package br.ufpr.tads.cliente;

import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import br.ufpr.tads.auth.CadastroClienteRequest;
import br.ufpr.tads.usuario.UsuarioService;
import br.ufpr.tads.usuario.UsuarioService.NovoUsuario;

@Service
public class ClienteService {

    private final ClienteRepository repository;
    private final UsuarioService usuarioService;

    public ClienteService(
            ClienteRepository repository,
            UsuarioService usuarioService) {
        this.repository = repository;
        this.usuarioService = usuarioService;
    }

    @Transactional(readOnly = true)
    public List<Cliente> listar() {
        return repository.findAllByUsuarioAtivoTrueOrderByUsuarioNomeAsc();
    }

    @Transactional(readOnly = true)
    public Cliente buscarPorId(Integer id) {
        return buscarAtivo(id);
    }

    @Transactional
    public Cliente cadastrar(CadastroClienteRequest request) {
        String cpf = request.cpf().trim();

        if (repository.existsByCpf(cpf)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este CPF já está cadastrado.");
        }

        NovoUsuario novo = usuarioService.criar(
                request.nome(),
                request.email(),
                "CLIENTE");

        Cliente cliente = repository.save(new Cliente(
                novo.usuario(),
                cpf,
                request.telefone().trim(),
                request.cep().trim(),
                request.logradouro().trim(),
                request.numero().trim(),
                normalizarOpcional(request.complemento()),
                request.bairro().trim(),
                request.cidade().trim(),
                request.uf().trim().toUpperCase(Locale.ROOT)));

        // O envio depende da configuração SMTP.
        usuarioService.enviarSenhaTemporaria(
                novo.usuario().getEmail(),
                novo.senhaTemporaria());

        return cliente;
    }

    @Transactional
    public Cliente atualizar(Integer id, CadastroClienteRequest request) {
        Cliente cliente = buscarAtivo(id);
        String cpf = request.cpf().trim();

        if (repository.existsByCpfAndUsuarioIdNot(cpf, id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este CPF já está cadastrado.");
        }

        usuarioService.atualizarDados(
                cliente.getUsuario(),
                request.nome(),
                request.email());

        cliente.atualizarDados(
                cpf,
                request.telefone().trim(),
                request.cep().trim(),
                request.logradouro().trim(),
                request.numero().trim(),
                normalizarOpcional(request.complemento()),
                request.bairro().trim(),
                request.cidade().trim(),
                request.uf().trim().toUpperCase(Locale.ROOT));

        return cliente;
    }

    @Transactional
    public void inativar(Integer id) {
        // O status fica só em Usuario; o login já recusa usuários inativos.
        buscarAtivo(id).getUsuario().inativar();
    }

    @Transactional(readOnly = true)
    public List<Cliente> listarInativos() {
        return repository.findAllByUsuarioAtivoFalseOrderByUsuarioNomeAsc();
    }

    @Transactional
    public Cliente reativar(Integer id) {
        Cliente cliente = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Cliente não encontrado."));

        if (cliente.getUsuario().isAtivo()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "O cliente já está ativo.");
        }

        cliente.getUsuario().ativar();

        return cliente;
    }

    private Cliente buscarAtivo(Integer id) {
        return repository.findById(id)
                .filter(c -> c.getUsuario().isAtivo())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Cliente não encontrado."));
    }

    private String normalizarOpcional(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }

        return valor.trim();
    }
}