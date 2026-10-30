package br.ufpr.tads.funcionario;

import java.time.LocalDate;

import jakarta.persistence.*;

@Entity
@Table(name = "funcionario")
public class Funcionario {

    @Id
    @Column(name = "usuario_id")
    private Integer usuarioId;

    @Column(name = "data_nascimento", nullable = false)
    private LocalDate dataNascimento;

    public Funcionario() {

    }

    public Funcionario(Integer usuarioId, LocalDate dataNascimento) {
        this.usuarioId = usuarioId;
        this.dataNascimento = dataNascimento;
    }

    public Integer getUsuarioId() {
        return this.usuarioId;
    }

    public void setUsuarioId(Integer usuarioId) {
        this.usuarioId = usuarioId;
    }

    public LocalDate getDataNascimento() {
        return this.dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }
}