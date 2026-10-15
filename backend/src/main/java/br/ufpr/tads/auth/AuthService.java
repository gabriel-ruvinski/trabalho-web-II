package br.ufpr.tads.auth;

import java.util.Locale;

import br.ufpr.tads.cliente.Cliente;
import br.ufpr.tads.cliente.ClienteRepository;
import br.ufpr.tads.usuario.Perfil;
import br.ufpr.tads.usuario.PerfilRepository;
import br.ufpr.tads.usuario.Usuario;
import br.ufpr.tads.usuario.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final PerfilRepository perfilRepository;
    private final PasswordService passwordService;
    private final JavaMailSender mailSender;

    public AuthService(
            UsuarioRepository usuarioRepository,
            ClienteRepository clienteRepository,
            PerfilRepository perfilRepository,
            PasswordService passwordService,
            JavaMailSender mailSender) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.perfilRepository = perfilRepository;
        this.passwordService = passwordService;
        this.mailSender = mailSender;
    }

    @Transactional
    public void cadastrar(CadastroClienteRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String cpf = request.cpf().trim();

        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este e-mail já está cadastrado.");
        }

        if (clienteRepository.existsByCpf(cpf)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este CPF já está cadastrado.");
        }

        Perfil perfilCliente = perfilRepository.findByCodigo("CLIENTE")
                .orElseThrow(() -> new IllegalStateException(
                        "Perfil CLIENTE não encontrado no banco."));

        String senhaTemporaria = passwordService.gerarSenhaTemporaria();

        String salt = passwordService.gerarSalt();

        String hash = passwordService.gerarHash(
                senhaTemporaria,
                salt);

        Usuario usuario = new Usuario(
                request.nome().trim(),
                email,
                hash,
                salt,
                perfilCliente);

        // Primeiro salvamos o usuário para obter seu ID.
        usuario = usuarioRepository.saveAndFlush(usuario);

        Cliente cliente = new Cliente(
                usuario,
                cpf,
                request.telefone().trim(),
                request.cep().trim(),
                request.logradouro().trim(),
                request.numero().trim(),
                normalizarOpcional(request.complemento()),
                request.bairro().trim(),
                request.cidade().trim(),
                request.uf().trim().toUpperCase(Locale.ROOT));

        clienteRepository.save(cliente);

        // O envio depende da configuração SMTP.
        enviarSenhaTemporaria(email, senhaTemporaria);
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

    private String normalizarOpcional(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }

        return valor.trim();
    }

    private void enviarSenhaTemporaria(
            String destinatario,
            String senha) {
        SimpleMailMessage mensagem = new SimpleMailMessage();

        mensagem.setTo(destinatario);
        mensagem.setSubject("Senha temporária - Sistema de manutenção");
        mensagem.setText(
                "Seu cadastro foi realizado.\n\n"
                        + "Sua senha temporária é: " + senha + "\n\n"
                        + "Guarde essa informação em segurança.");

        mailSender.send(mensagem);
    }
}