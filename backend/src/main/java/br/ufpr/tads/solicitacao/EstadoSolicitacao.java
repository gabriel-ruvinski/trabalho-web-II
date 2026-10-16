package br.ufpr.tads.solicitacao;

import jakarta.persistence.*;

@Entity
@Table(name = "estado_solicitacao")
public class EstadoSolicitacao {

    @Id
    private Integer id;

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(nullable = false, length = 50)
    private String nome;

    public EstadoSolicitacao() {
    }

    public Integer getId() {
        return id;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getNome() {
        return nome;
    }
}