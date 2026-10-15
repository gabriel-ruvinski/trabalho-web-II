
package br.ufpr.tads.manutencao.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categoria_equipamento")


public class CategoriaEquipamento{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Integer id;
    private String nome;
    private Boolean ativo;

    public CategoriaEquipamento() {}
    public CategoriaEquipamento(Integer id, String nome, Boolean ativo){
        
        this.id = id;
        this.nome = nome;
        this.ativo = ativo;
    }
}

public Integer getId() {
    return id;
}

public void setId(Integer id){
    this.id = id;
}

public String getNome(){
    return this.nome;
}

public String setNome(String nome){
    this.nome = nome;
}

public Bollean getAtivo(){
    return this.Ativo;
}

public void setBoolean(Boolean ativo){
    this.ativo = ativo;
}