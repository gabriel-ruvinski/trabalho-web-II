INSERT INTO usuario (nome, email, senha_hash, salt, perfil_id, ativo)
SELECT 'Funcionário Teste',
       'funcionario@gmail.com',
       'e217b475003a8427f285c08ce8704f7f3f5bc4ff5d7eb2ec0851ffec71cd4237',
       'a1b2c3d4e5f60718293a4b5c6d7e8f90',
       p.id,
       TRUE
FROM perfil p
WHERE p.codigo = 'FUNCIONARIO'
  AND NOT EXISTS (SELECT 1 FROM usuario WHERE LOWER(email) = 'funcionario@gmail.com');

INSERT INTO funcionario (usuario_id, data_nascimento)
SELECT u.id, DATE '1990-01-01'
FROM usuario u
WHERE LOWER(u.email) = 'funcionario@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM funcionario f WHERE f.usuario_id = u.id);