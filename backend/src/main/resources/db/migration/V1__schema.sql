/* V1: schema inicial do sistema de Controle de Manutenção de Equipamentos */

/* ---------- TABELAS DE APOIO (previamente preenchidas) ---------- */

CREATE TABLE perfil (
    id      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo  VARCHAR(20) NOT NULL UNIQUE,
    nome    VARCHAR(50) NOT NULL
);

CREATE TABLE estado_solicitacao (
    id      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo  VARCHAR(20) NOT NULL UNIQUE,
    nome    VARCHAR(50) NOT NULL
);

INSERT INTO perfil (codigo, nome) VALUES
    ('CLIENTE', 'Cliente'),
    ('FUNCIONARIO', 'Funcionário');

INSERT INTO estado_solicitacao (codigo, nome) VALUES
    ('ABERTA', 'Aberta'),
    ('ORCADA', 'Orçada'),
    ('REJEITADA', 'Rejeitada'),
    ('APROVADA', 'Aprovada'),
    ('REDIRECIONADA', 'Redirecionada'),
    ('ARRUMADA', 'Arrumada'),
    ('PAGA', 'Paga'),
    ('FINALIZADA', 'Finalizada');

/* ---------- USUÁRIOS ---------- */

CREATE TABLE usuario (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome        VARCHAR(150) NOT NULL,
    email       VARCHAR(150) NOT NULL,
    senha_hash  VARCHAR(64)  NOT NULL,
    salt        VARCHAR(32)  NOT NULL,
    perfil_id   INTEGER      NOT NULL REFERENCES perfil (id),
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE UNIQUE INDEX ux_usuario_email ON usuario (LOWER(email));
CREATE INDEX ix_usuario_perfil ON usuario (perfil_id);

CREATE TABLE cliente (
    usuario_id   INTEGER PRIMARY KEY REFERENCES usuario (id),
    cpf          VARCHAR(11)  NOT NULL UNIQUE,
    telefone     VARCHAR(11)  NOT NULL,
    cep          VARCHAR(8)   NOT NULL,
    logradouro   VARCHAR(150) NOT NULL,
    numero       VARCHAR(10)  NOT NULL,
    complemento  VARCHAR(100),
    bairro       VARCHAR(100) NOT NULL,
    cidade       VARCHAR(100) NOT NULL,
    uf           VARCHAR(2)   NOT NULL,
    CONSTRAINT ck_cliente_uf CHECK (LENGTH(uf) = 2)
);

CREATE TABLE funcionario (
    usuario_id       INTEGER PRIMARY KEY REFERENCES usuario (id),
    data_nascimento  DATE NOT NULL
);

/* ---------- CATEGORIAS ---------- */

CREATE TABLE categoria_equipamento (
    id     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome   VARCHAR(100) NOT NULL UNIQUE,
    ativo  BOOLEAN      NOT NULL DEFAULT TRUE
);

/* ---------- SOLICITAÇÕES ---------- */

CREATE TABLE solicitacao (
    id                         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cliente_id                 INTEGER      NOT NULL REFERENCES cliente (usuario_id),
    categoria_id               INTEGER      NOT NULL REFERENCES categoria_equipamento (id),
    estado_id                  INTEGER      NOT NULL REFERENCES estado_solicitacao (id),
    descricao_equipamento      VARCHAR(255) NOT NULL,
    descricao_defeito          TEXT         NOT NULL,
    data_hora_abertura         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    valor_orcado               NUMERIC(10,2),
    funcionario_orcamento_id   INTEGER REFERENCES funcionario (usuario_id),
    data_hora_orcamento        TIMESTAMP,

    motivo_rejeicao            TEXT,

    funcionario_destino_id     INTEGER REFERENCES funcionario (usuario_id),

    descricao_manutencao       TEXT,
    orientacoes_cliente        TEXT,
    funcionario_manutencao_id  INTEGER REFERENCES funcionario (usuario_id),
    data_hora_manutencao       TIMESTAMP,

    data_hora_pagamento        TIMESTAMP,

    funcionario_finalizacao_id INTEGER REFERENCES funcionario (usuario_id),
    data_hora_finalizacao      TIMESTAMP,

    CONSTRAINT ck_solicitacao_valor CHECK (valor_orcado IS NULL OR valor_orcado >= 0)
);

CREATE INDEX ix_solicitacao_cliente   ON solicitacao (cliente_id);
CREATE INDEX ix_solicitacao_estado    ON solicitacao (estado_id);
CREATE INDEX ix_solicitacao_categoria ON solicitacao (categoria_id);
CREATE INDEX ix_solicitacao_abertura  ON solicitacao (data_hora_abertura);
CREATE INDEX ix_solicitacao_destino   ON solicitacao (funcionario_destino_id);
CREATE INDEX ix_solicitacao_pagamento ON solicitacao (data_hora_pagamento);

/* ---------- HISTÓRICO DE ALTERAÇÕES DE ESTADO ---------- */

CREATE TABLE historico_solicitacao (
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    solicitacao_id          BIGINT    NOT NULL REFERENCES solicitacao (id),
    estado_anterior_id      INTEGER   REFERENCES estado_solicitacao (id),
    estado_novo_id          INTEGER   NOT NULL REFERENCES estado_solicitacao (id),
    data_hora               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_id              INTEGER   NOT NULL REFERENCES usuario (id),
    funcionario_destino_id  INTEGER   REFERENCES funcionario (usuario_id),
    observacao              TEXT
);

CREATE INDEX ix_historico_solicitacao ON historico_solicitacao (solicitacao_id, data_hora);