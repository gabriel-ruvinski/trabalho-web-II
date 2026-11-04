INSERT INTO categoria_equipamento (nome, ativo) VALUES
    ('Notebook', TRUE), ('Desktop', TRUE), ('Impressora', TRUE),
    ('Mouse', TRUE), ('Teclado', TRUE), ('Monitor', TRUE)
ON CONFLICT (nome) DO NOTHING;

INSERT INTO usuario (nome, email, senha_hash, salt, perfil_id, ativo)
SELECT d.nome, d.email,
       encode(sha256(convert_to(md5(d.email) || ':' || '1234', 'UTF8')), 'hex'),
       md5(d.email), p.id, TRUE
FROM (VALUES
    ('Ana Souza',       'ana.souza@demo.local',       'CLIENTE'),
    ('Bruno Lima',      'bruno.lima@demo.local',      'CLIENTE'),
    ('Carla Mendes',    'carla.mendes@demo.local',    'CLIENTE'),
    ('Diego Rocha',     'diego.rocha@demo.local',     'CLIENTE'),
    ('Eduarda Alves',   'eduarda.alves@demo.local',   'CLIENTE'),
    ('Marcos Oliveira', 'marcos.oliveira@demo.local', 'FUNCIONARIO'),
    ('Patrícia Lopes',  'patricia.lopes@demo.local',  'FUNCIONARIO'),
    ('Rafael Costa',    'rafael.costa@demo.local',    'FUNCIONARIO')
) AS d(nome, email, perfil)
JOIN perfil p ON p.codigo = d.perfil;

INSERT INTO cliente (usuario_id, cpf, telefone, cep, logradouro, numero, complemento, bairro, cidade, uf)
SELECT u.id, d.cpf, d.telefone, d.cep, d.logradouro, d.numero, d.complemento, d.bairro, d.cidade, d.uf
FROM (VALUES
    ('ana.souza@demo.local',     '39053344705', '41999990001', '80010000', 'Rua XV de Novembro',   '100',  NULL,      'Centro',     'Curitiba', 'PR'),
    ('bruno.lima@demo.local',    '11144477735', '41999990002', '80215090', 'Av. Sete de Setembro', '2500', 'Apto 31', 'Batel',      'Curitiba', 'PR'),
    ('carla.mendes@demo.local',  '12345678909', '41999990003', '83005000', 'Rua Pedro Ivo',        '45',   NULL,      'Centro',     'São José dos Pinhais', 'PR'),
    ('diego.rocha@demo.local',   '98765432100', '41999990004', '81530000', 'Rua Cel. Dulcídio',    '780',  'Casa 2',  'Água Verde', 'Curitiba', 'PR'),
    ('eduarda.alves@demo.local', '24681357928', '41999990005', '82100000', 'Rua Mateus Leme',      '1200', NULL,      'Bom Retiro', 'Curitiba', 'PR')
) AS d(email, cpf, telefone, cep, logradouro, numero, complemento, bairro, cidade, uf)
JOIN usuario u ON LOWER(u.email) = d.email;

INSERT INTO funcionario (usuario_id, data_nascimento)
SELECT u.id, d.data_nascimento
FROM (VALUES
    ('marcos.oliveira@demo.local', DATE '1988-03-14'),
    ('patricia.lopes@demo.local',  DATE '1992-07-02'),
    ('rafael.costa@demo.local',    DATE '1985-11-23')
) AS d(email, data_nascimento)
JOIN usuario u ON LOWER(u.email) = d.email;

INSERT INTO solicitacao (
    cliente_id, categoria_id, estado_id, descricao_equipamento, descricao_defeito, data_hora_abertura,
    valor_orcado, funcionario_orcamento_id, data_hora_orcamento, motivo_rejeicao, funcionario_destino_id,
    descricao_manutencao, orientacoes_cliente, funcionario_manutencao_id, data_hora_manutencao,
    data_hora_pagamento, funcionario_finalizacao_id, data_hora_finalizacao)
SELECT
    cli.id, cat.id, est.id, d.equipamento, d.defeito, ab,
    CASE WHEN est.codigo <> 'ABERTA' THEN d.valor END,
    CASE WHEN est.codigo <> 'ABERTA' THEN fun.id END,
    CASE WHEN est.codigo <> 'ABERTA' THEN ab + INTERVAL '4 hours' END,
    CASE WHEN est.codigo = 'REJEITADA' THEN 'Valor acima do esperado.' END,
    CASE WHEN est.codigo = 'REDIRECIONADA' THEN dest.id END,
    CASE WHEN est.codigo IN ('ARRUMADA','PAGA','FINALIZADA') THEN 'Equipamento diagnosticado e reparado.' END,
    CASE WHEN est.codigo IN ('ARRUMADA','PAGA','FINALIZADA') THEN 'Retirar o equipamento na recepção.' END,
    CASE WHEN est.codigo IN ('ARRUMADA','PAGA','FINALIZADA') THEN fun.id END,
    CASE WHEN est.codigo IN ('ARRUMADA','PAGA','FINALIZADA') THEN ab + INTERVAL '2 days' END,
    CASE WHEN est.codigo IN ('PAGA','FINALIZADA') THEN ab + INTERVAL '3 days' END,
    CASE WHEN est.codigo = 'FINALIZADA' THEN fun.id END,
    CASE WHEN est.codigo = 'FINALIZADA' THEN ab + INTERVAL '3 days 3 hours' END
FROM (VALUES
    -- cliente,                   categoria,    equipamento,                   defeito,                           estado,          valor,   funcionário,                  destino,                    dias
    ('ana.souza@demo.local',     'Notebook',   'Notebook Dell Inspiron 15',   'Não liga após queda de energia',  'FINALIZADA',    850.00,  'marcos.oliveira@demo.local', NULL,                        20),
    ('bruno.lima@demo.local',    'Notebook',   'Notebook Lenovo IdeaPad 3',   'Tela com listras horizontais',    'PAGA',          420.50,  'patricia.lopes@demo.local',  NULL,                        20),
    ('carla.mendes@demo.local',  'Impressora', 'Impressora HP LaserJet Pro',  'Papel atolando constantemente',   'FINALIZADA',    180.00,  'rafael.costa@demo.local',    NULL,                        19),
    ('diego.rocha@demo.local',   'Desktop',    'Desktop Positivo Master',     'Reinicia sozinho durante o uso',  'FINALIZADA',    600.00,  'marcos.oliveira@demo.local', NULL,                        17),
    ('eduarda.alves@demo.local', 'Mouse',      'Mouse Logitech M185',         'Botão de clique falhando',        'PAGA',           45.90,  'rafael.costa@demo.local',    NULL,                        17),
    ('ana.souza@demo.local',     'Teclado',    'Teclado Dell KB216',          'Teclas não respondem',            'FINALIZADA',     89.90,  'patricia.lopes@demo.local',  NULL,                        15),
    ('bruno.lima@demo.local',    'Desktop',    'Desktop Dell OptiPlex',       'Sistema não inicializa',          'PAGA',          380.00,  'marcos.oliveira@demo.local', NULL,                        14),
    ('carla.mendes@demo.local',  'Notebook',   'MacBook Air M1',              'Bateria não carrega',             'FINALIZADA',   1200.00,  'patricia.lopes@demo.local',  NULL,                        13),
    ('diego.rocha@demo.local',   'Impressora', 'Impressora Epson L3250',      'Cabeça de impressão entupida',    'FINALIZADA',    220.00,  'rafael.costa@demo.local',    NULL,                        13),
    ('eduarda.alves@demo.local', 'Notebook',   'Notebook Acer Aspire 5',      'Superaquecimento e desligamentos','PAGA',          310.00,  'marcos.oliveira@demo.local', NULL,                        11),
    ('ana.souza@demo.local',     'Mouse',      'Mouse Multilaser sem fio',    'Não conecta ao receptor',         'FINALIZADA',     59.90,  'rafael.costa@demo.local',    NULL,                        30),
    ('bruno.lima@demo.local',    'Teclado',    'Teclado Logitech K400',       'Líquido derramado sobre o teclado','FINALIZADA',   120.00,  'patricia.lopes@demo.local',  NULL,                        28),
    ('carla.mendes@demo.local',  'Monitor',    'Monitor LG 24 polegadas',     'Imagem piscando',                 'ABERTA',         NULL,   'marcos.oliveira@demo.local', NULL,                         3),
    ('diego.rocha@demo.local',   'Mouse',      'Mouse Razer DeathAdder',      'Scroll travando',                 'ABERTA',         NULL,   'rafael.costa@demo.local',    NULL,                         4),
    ('eduarda.alves@demo.local', 'Notebook',   'Notebook Samsung Book',       'Teclado com falhas',              'ORCADA',        700.00,  'marcos.oliveira@demo.local', NULL,                         5),
    ('ana.souza@demo.local',     'Desktop',    'Desktop Gamer personalizado', 'Placa de vídeo sem imagem',       'ORCADA',        450.00,  'patricia.lopes@demo.local',  NULL,                         6),
    ('bruno.lima@demo.local',    'Notebook',   'Notebook Asus VivoBook',      'Dobradiça quebrada',              'REJEITADA',     950.00,  'rafael.costa@demo.local',    NULL,                         9),
    ('carla.mendes@demo.local',  'Impressora', 'Impressora Brother DCP',      'Falha na digitalização',          'REJEITADA',     400.00,  'marcos.oliveira@demo.local', NULL,                         8),
    ('diego.rocha@demo.local',   'Desktop',    'Desktop Lenovo ThinkCentre',  'Lentidão extrema',                'APROVADA',      330.00,  'patricia.lopes@demo.local',  NULL,                         7),
    ('eduarda.alves@demo.local', 'Notebook',   'Notebook HP Pavilion',        'Tela quebrada',                   'APROVADA',      780.00,  'rafael.costa@demo.local',    NULL,                         7),
    ('ana.souza@demo.local',     'Impressora', 'Impressora Canon G3110',      'Não puxa o papel',                'REDIRECIONADA', 260.00,  'marcos.oliveira@demo.local', 'rafael.costa@demo.local',   6),
    ('bruno.lima@demo.local',    'Mouse',      'Mouse Gamer Redragon',        'Sensor com falha',                'REDIRECIONADA',  70.00,  'patricia.lopes@demo.local',  'marcos.oliveira@demo.local',6),
    ('carla.mendes@demo.local',  'Notebook',   'Notebook Positivo Motion',    'HD com ruído',                    'ARRUMADA',      540.00,  'rafael.costa@demo.local',    NULL,                         5),
    ('diego.rocha@demo.local',   'Teclado',    'Teclado Mecânico Redragon',   'Switches falhando',               'ARRUMADA',       99.90,  'marcos.oliveira@demo.local', NULL,                         5)
) AS d(cliente, categoria, equipamento, defeito, estado, valor, funcionario, destino, dias)
JOIN usuario cli               ON LOWER(cli.email) = d.cliente
JOIN categoria_equipamento cat ON cat.nome = d.categoria
JOIN estado_solicitacao est    ON est.codigo = d.estado
JOIN usuario fun               ON LOWER(fun.email) = d.funcionario
LEFT JOIN usuario dest         ON LOWER(dest.email) = d.destino
CROSS JOIN LATERAL (SELECT date_trunc('minute', LOCALTIMESTAMP - d.dias * INTERVAL '1 day') AS ab) t;

INSERT INTO historico_solicitacao (solicitacao_id, estado_anterior_id, estado_novo_id, data_hora, usuario_id, observacao)
SELECT id, NULL, estado_id, data_hora_abertura, cliente_id, 'Carga de demonstração.'
FROM solicitacao;