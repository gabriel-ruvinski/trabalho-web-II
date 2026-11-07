package br.ufpr.tads.funcionario;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import br.ufpr.tads.usuario.Usuario;
import br.ufpr.tads.usuario.UsuarioService;

@Service
public class FuncionarioService {

    private final FuncionarioRepository repository;
    private final UsuarioService usuarioService;

    public FuncionarioService(
            FuncionarioRepository repository,
            UsuarioService usuarioService) {
        this.repository = repository;
        this.usuarioService = usuarioService;
    }

    @Transactional(readOnly = true)
    public List<Funcionario> listar() {
        return repository.findAllByUsuarioAtivoTrueOrderByUsuarioNomeAsc();
    }

    @Transactional(readOnly = true)
    public Funcionario buscarPorId(Integer id) {
        return buscarAtivo(id);
    }

    @Transactional
    public Funcionario cadastrar(FuncionarioDTO request) {
        if (request.senha() == null || request.senha().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe a senha.");
        }

        Usuario usuario = usuarioService.criarComSenha(
                request.nome(),
                request.email(),
                "FUNCIONARIO",
                request.senha());

        return repository.save(
                new Funcionario(usuario, request.dataNascimento()));
    }

    @Transactional
    public Funcionario atualizar(Integer id, FuncionarioDTO request) {
        Funcionario funcionario = buscarAtivo(id);

        usuarioService.atualizarDados(
                funcionario.getUsuario(),
                request.nome(),
                request.email());

        funcionario.setDataNascimento(request.dataNascimento());

        usuarioService.alterarSenha(funcionario.getUsuario(), request.senha());

        return funcionario;
    }

    @Transactional
    public void inativar(Integer id) {
        // O status fica só em Usuario; o login já recusa usuários inativos.
        buscarAtivo(id).getUsuario().inativar();
    }

    private Funcionario buscarAtivo(Integer id) {
        return repository.findById(id)
                .filter(f -> f.getUsuario().isAtivo())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Funcionário não encontrado."));
    }
}