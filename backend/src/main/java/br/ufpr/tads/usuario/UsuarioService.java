package br.ufpr.tads.usuario;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import br.ufpr.tads.auth.PasswordService;

@Service
public class UsuarioService {

    public record NovoUsuario(Usuario usuario, String senhaTemporaria) {}

    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;
    private final PasswordService passwordService;
    private final JavaMailSender mailSender;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PerfilRepository perfilRepository,
            PasswordService passwordService,
            JavaMailSender mailSender) {
        this.usuarioRepository = usuarioRepository;
        this.perfilRepository = perfilRepository;
        this.passwordService = passwordService;
        this.mailSender = mailSender;
    }

    @Transactional
    public NovoUsuario criar(String nome, String email, String codigoPerfil) {
        String emailNormalizado = normalizarEmail(email);

        if (usuarioRepository.existsByEmailIgnoreCase(emailNormalizado)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este e-mail já está cadastrado.");
        }

        Perfil perfil = perfilRepository.findByCodigo(codigoPerfil)
                .orElseThrow(() -> new IllegalStateException(
                        "Perfil " + codigoPerfil + " não encontrado no banco."));

        String senhaTemporaria = passwordService.gerarSenhaTemporaria();
        String salt = passwordService.gerarSalt();
        String hash = passwordService.gerarHash(senhaTemporaria, salt);

        // saveAndFlush para já termos o ID quando a tabela filha for salva.
        Usuario usuario = usuarioRepository.saveAndFlush(
                new Usuario(nome.trim(), emailNormalizado, hash, salt, perfil));

        return new NovoUsuario(usuario, senhaTemporaria);
    }

    @Transactional
    public void atualizarDados(Usuario usuario, String nome, String email) {
        String emailNormalizado = normalizarEmail(email);

        if (usuarioRepository.existsByEmailIgnoreCaseAndIdNot(
                emailNormalizado, usuario.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este e-mail já está cadastrado.");
        }

        usuario.atualizarDados(nome.trim(), emailNormalizado);
    }

    public void enviarSenhaTemporaria(String destinatario, String senha) {
        SimpleMailMessage mensagem = new SimpleMailMessage();

        mensagem.setTo(destinatario);
        mensagem.setSubject("Senha temporária - Sistema de manutenção");
        mensagem.setText(
                "Seu cadastro foi realizado.\n\n"
                        + "Sua senha temporária é: " + senha + "\n\n"
                        + "Guarde essa informação em segurança.");

        mailSender.send(mensagem);
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}