package br.ufpr.tads.funcionario;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import br.ufpr.tads.usuario.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "funcionario")
@JsonPropertyOrder({"id", "nome", "email", "dataNascimento"})
public class Funcionario {

    @Id
    @Column(name = "usuario_id")
    private Integer usuarioId;

    @OneToOne(optional = false)
    @MapsId
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "data_nascimento", nullable = false)
    private LocalDate dataNascimento;

    protected Funcionario() {
    }

    public Funcionario(Usuario usuario, LocalDate dataNascimento) {
        this.usuario = usuario;
        this.dataNascimento = dataNascimento;
    }

    @JsonProperty("id")
    public Integer getUsuarioId() {
        return usuarioId;
    }

    @JsonIgnore
    public Usuario getUsuario() {
        return usuario;
    }

    public String getNome() {
        return usuario.getNome();
    }

    public String getEmail() {
        return usuario.getEmail();
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }
}