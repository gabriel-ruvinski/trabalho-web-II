INSERT INTO categoria_equipamento (nome, ativo)
VALUES
    ('Notebook', TRUE),
    ('Desktop', TRUE),
    ('Impressora', TRUE),
    ('Mouse', TRUE),
    ('Teclado', TRUE)
ON CONFLICT (nome) DO NOTHING;