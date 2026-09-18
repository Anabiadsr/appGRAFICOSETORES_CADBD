CREATE DATABASE grafico_farmacia;
USE grafico_farmacia; 

CREATE TABLE venda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    remedio VARCHAR(100) NOT NULL,
    quantidade INT NOT NULL
);

INSERT INTO venda (remedio, quantidade)
VALUES
('Paracetamol', 15),
('Ibuprofeno', 20),
('Dipirona', 18);

SELECT * FROM venda;

