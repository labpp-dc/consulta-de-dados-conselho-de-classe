-- Active: 1762377016545@@127.0.0.1@5432@frequencia@public
DROP TABLE IF EXISTS Cursos;
DROP TABLE IF EXISTS AnoLetivo;
DROP TABLE IF EXISTS Turmas;
DROP TABLE IF EXISTS estudante;
DROP TABLE IF EXISTS TurmaEstudante;
DROP TABLE IF EXISTS email;
DROP TABLE IF EXISTS Entrada;
DROP TABLE IF EXISTS Saida;
DROP TABLE IF EXISTS Ocorrencias;
DROP TABLE IF EXISTS Visitante;
DROP TABLE IF EXISTS Ocorrencias;
DROP TABLE IF EXISTS Funcionario;


CREATE TABLE Cursos (
    id bigint GENERATED ALWAYS AS IDENTITY,
    Nome TEXT NOT NULL,

    CONSTRAINT pk_curso PRIMARY KEY (id)
);
INSERT INTO Cursos (Nome) VALUES ('DS');

CREATE TABLE AnoLetivo (
    id bigint GENERATED ALWAYS AS IDENTITY,
    Ano TEXT NOT NULL,
    
    CONSTRAINT pk_AnoLetivo PRIMARY KEY (id)
);

INSERT INTO AnoLetivo (Ano) VALUES ('2025');
CREATE TABLE Turmas (
    id bigint GENERATED ALWAYS AS IDENTITY,
    nome TEXT NOT NULL,
    
    turno TEXT NOT NULL,
    serie INTEGER NOT NULL,

    
    CONSTRAINT pk_turma PRIMARY KEY (id),
    curso_id INTEGER NOT NULL,
    FOREIGN KEY (curso_id) REFERENCES Cursos(id),
    anoLetivo_id INTEGER NOT NULL,
    FOREIGN KEY (anoLetivo_id) REFERENCES AnoLetivo(id)
    -- CONSTRAINT ck_turma_serie CHECK a fazer
    -- Fazer um constraint para nome de turma
    -- Criar atributo número para turma
);
    -- CONSTRAINT ck_usuario_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'), -- formato de email com expressão regular
    -- CONSTRAINT ck_usuario_senha_length CHECK (length(senha) >= 6), -- comprimento mínimo
    -- CONSTRAINT ck_usuario_role_valid CHECK (role IN ( 'user')) -- tipos de usuário


CREATE TABLE estudante (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    nome TEXT NOT NULL,
    nomeSocial TEXT,
    matricula TEXT UNIQUE NOT NULL,
    suspenso INTEGER,
    foto TEXT NOT NULL,
    
    CONSTRAINT pk_usuario PRIMARY KEY (id),
    CONSTRAINT ck_usuario_matricula_length CHECK (length(matricula) = 8 OR length(matricula) = 9), -- comprimento
    turma_id INTEGER NOT NULL,
    FOREIGN KEY (turma_id) REFERENCES Turmas(id)
    
);


CREATE TABLE TurmaEstudante (
    id bigint GENERATED ALWAYS AS IDENTITY,

    CONSTRAINT pk_turmaEstudante PRIMARY KEY (id),
    turma_id INTEGER NOT NULL,
    estudante_id INTEGER NOT NULL,
    FOREIGN KEY (turma_id) REFERENCES Turmas(id),
    FOREIGN KEY (estudante_id) REFERENCES estudante(id)

);


CREATE TABLE email(
    id bigint GENERATED ALWAYS AS IDENTITY,
    endereco TEXT NOT NULL,
    
    CONSTRAINT pk_email PRIMARY KEY (id),
    estudante_id INTEGER NOT NULL,
    FOREIGN KEY (estudante_id) REFERENCES estudante(id)


);


CREATE TABLE Entrada(
    id bigint GENERATED ALWAYS AS IDENTITY,
    data TIMESTAMP NOT NULL,
    almoco INTEGER,

    CONSTRAINT pk_Entrada PRIMARY KEY (id),
    estudante_id INTEGER NOT NULL,
    FOREIGN KEY(estudante_id) REFERENCES estudante(id)
);

CREATE TABLE Saida(
    id bigint GENERATED ALWAYS AS IDENTITY,
    data TIMESTAMP NOT NULL,

    CONSTRAINT pk_saida PRIMARY KEY (id),
    estudante_id INTEGER NOT NULL,
    FOREIGN KEY(estudante_id) REFERENCES estudante(id)
);
CREATE TABLE Ocorrencias(
    id bigint GENERATED ALWAYS AS IDENTITY,
    uniforme TEXT,
    atraso TEXT,
    comportamento TEXT,
    data TIMESTAMP NOT NULL,

    CONSTRAINT pk_ocorrencias PRIMARY KEY (id),
    estudante_id INTEGER NOT NULL,
    FOREIGN KEY(estudante_id) REFERENCES estudante(id)
);
CREATE TABLE Visitante(
    id bigint GENERATED ALWAYS AS IDENTITY,
    nome TEXT NOT NULL,
    nomeSocial TEXT,
    tipodeCadastrante TEXT NOT NULL,
    CPF TEXT NOT NULL,
    foto TEXT, 

    CONSTRAINT pk_visitante PRIMARY KEY (id)

);



CREATE TABLE Funcionario(
    id bigint GENERATED ALWAYS AS IDENTITY,
    login TEXT NOT NULL,
    senha TEXT NOT NULL,
    role TEXT NOT NULL,

    CONSTRAINT pk_funcionario PRIMARY KEY (id)
);
    INSERT INTO Funcionario (login, senha, role) VALUES ('admin', '$2b$10$ypakIosLzNJNf3BvwAiys.Hthfykp7Zp/YealuGcgPfQhO85FNUPO', 'admin');
    --372586801668


    -- CONSTRAINT ck_usuario_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'), -- formato de email com expressão regular
    -- CONSTRAINT ck_usuario_senha_length CHECK (length(senha) >= 6), -- comprimento mínimo
    -- CONSTRAINT ck_usuario_role_valid CHECK (role IN ( 'user')) -- tipos de usuário
