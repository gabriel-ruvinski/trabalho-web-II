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

    public record NovoUsuario(Usuario usuario, String senhaTemporaria) {
    }

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
        String senhaTemporaria = passwordService.gerarSenhaTemporaria();
        Usuario usuario = salvarNovo(nome, email, codigoPerfil, senhaTemporaria);

        return new NovoUsuario(usuario, senhaTemporaria);
    }

    @Transactional
    public Usuario criarComSenha(
            String nome, String email, String codigoPerfil, String senha) {
        return salvarNovo(nome, email, codigoPerfil, senha);
    }

    private Usuario salvarNovo(
            String nome, String email, String codigoPerfil, String senha) {
        String emailNormalizado = normalizarEmail(email);

        if (usuarioRepository.existsByEmailIgnoreCase(emailNormalizado)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este e-mail já está cadastrado.");
        }

        Perfil perfil = perfilRepository.findByCodigo(codigoPerfil)
                .orElseThrow(() -> new IllegalStateException(
                        "Perfil " + codigoPerfil + " não encontrado no banco."));

        String salt = passwordService.gerarSalt();
        String hash = passwordService.gerarHash(senha, salt);

        return usuarioRepository.saveAndFlush(
                new Usuario(nome.trim(), emailNormalizado, hash, salt, perfil));
    }
    @Transactional(readOnly = true)
    public Usuario exigirFuncionario(Integer solicitanteId) {
        if (solicitanteId == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Usuário não identificado");
        }

        Usuario usuario = usuarioRepository.findById(solicitanteId)
                .filter(Usuario::isAtivo)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Usuário inválido ou inativo"));

        if (!"FUNCIONARIO".equals(usuario.getPerfil().getCodigo())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Acesso restrito a funcionários");
        }

        return usuario;
    }

        @Transactional(readOnly = true)
    public Usuario exigirFuncionarioOuProprio(Integer solicitanteId, Integer idConsultado) {
        if (solicitanteId == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Usuário não identificado");
        }

        Usuario usuario = usuarioRepository.findById(solicitanteId)
                .filter(Usuario::isAtivo)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Usuário inválido ou inativo"));

        boolean funcionario = "FUNCIONARIO".equals(usuario.getPerfil().getCodigo());

        if (!funcionario && !usuario.getId().equals(idConsultado)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Acesso restrito a funcionários");
        }

        return usuario;
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

    public void enviarNovaSenha(String destinatario, String senha) {
        SimpleMailMessage mensagem = new SimpleMailMessage();

        mensagem.setTo(destinatario);
        mensagem.setSubject("Recuperação de senha - Sistema de manutenção");
        mensagem.setText(
                "Recebemos um pedido de recuperação de senha.\n\n"
                        + "Sua nova senha é: " + senha + "\n\n"
                        + "Use-a para entrar no sistema.");

        mailSender.send(mensagem);
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    @Transactional
    public void alterarSenha(Usuario usuario, String senha) {
        String salt = passwordService.gerarSalt();
        String hash = passwordService.gerarHash(senha, salt);

        usuario.alterarSenha(hash, salt);
    }
}