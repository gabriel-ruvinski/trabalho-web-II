package br.ufpr.tads.auth;

import br.ufpr.tads.cliente.ClienteService;
import br.ufpr.tads.usuario.Usuario;
import br.ufpr.tads.usuario.UsuarioRepository;
import br.ufpr.tads.usuario.UsuarioService;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordService passwordService;
    private final ClienteService clienteService;
    private final UsuarioService usuarioService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordService passwordService,
            ClienteService clienteService,
            UsuarioService usuarioService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordService = passwordService;
        this.clienteService = clienteService;
        this.usuarioService = usuarioService;
    }

    @Transactional
    public void recuperarSenha(RecuperarSenhaRequest request) {
        usuarioRepository.findByEmailIgnoreCase(request.email().trim())
                .filter(Usuario::isAtivo)
                .ifPresent(usuario -> {
                    String novaSenha = passwordService.gerarSenhaTemporaria();
                    usuarioService.alterarSenha(usuario, novaSenha);
                    usuarioService.enviarNovaSenha(usuario.getEmail(), novaSenha);
                });
    }

    public void cadastrar(CadastroClienteRequest request) {
        clienteService.cadastrar(request);
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String email = request.email().trim();

        Usuario usuario = usuarioRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "E-mail ou senha inválidos."));

        if (!usuario.isAtivo()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "E-mail ou senha inválidos.");
        }

        boolean senhaValida = passwordService.verificarSenha(
                request.senha(),
                usuario.getSalt(),
                usuario.getSenhaHash());

        if (!senhaValida) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "E-mail ou senha inválidos.");
        }

        return new LoginResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil().getCodigo());
    }
}