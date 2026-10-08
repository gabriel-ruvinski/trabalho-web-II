package br.ufpr.tads.categoria;

import jakarta.persistence.*;

@Entity
@Table (name = "categoria-equipamento")
public class Categoria {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column (nullable = false, unique = true, length = 100)
    private String nome;

    @Column (nullable = false)
    private boolean ativo = true;

    public Categoria (){
    }

    public Integer getId (){
        return id;
    }

    public void setId (Integer id){
        this.id = id;
    }

    public String getNome (){
        return nome;
    }
    
    public void setNome (String nome){
        this.nome = nome;
    }

    public boolean isAtivo(){
        return ativo;
    }

    public void setAtivo (boolean ativo){
        this.ativo = ativo;
    }

}