DROP TABLE IF EXISTS estudante;

CREATE TABLE estudante (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    nome TEXT NOT NULL,
    nomeSocial TEXT,
    matricula TEXT UNIQUE NOT NULL,
    suspenso INTEGER,
    foto TEXT NOT NULL,
    

    
    -- Constraints
    CONSTRAINT pk_usuario PRIMARY KEY (id),
    CONSTRAINT ck_usuario_matricula_length CHECK (length(matricula) == 8 OR length(matricula) == 9), -- comprimento
    turma_id INTEGER NOT NULL,
    FOREIGN KEY (turma_id) REFERENCES Turmas(id)

);
CREATE TABLE Turmas (
    id bigint GENERATED ALWAYS AS IDENTITY,
    curso text NOT NULL,
    turno TEXT NOT NULL,
    serie INTEGER NOT NULL,

    
    -- Constraints
    CONSTRAINT pk_turma PRIMARY KEY (id),
    anoLetivo_id INTEGER NOT NULL,
    FOREIGN KEY (anoLetivo_id) REFERENCES AnoLetivo(id)

);
    -- CONSTRAINT ck_usuario_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'), -- formato de email com expressão regular
    -- CONSTRAINT ck_usuario_senha_length CHECK (length(senha) >= 6), -- comprimento mínimo
    -- CONSTRAINT ck_usuario_role_valid CHECK (role IN ( 'user')) -- tipos de usuário

CREATE TABLE TurmaEstudante (
    id bigint GENERATED ALWAYS AS IDENTITY,

    -- Constraints
    CONSTRAINT pk_turmaEstudante PRIMARY KEY (id),
    turma_id INTEGER NOT NULL,
    estudante_id INTEGER NOT NULL,
    FOREIGN KEY (turma_id) REFERENCES Turmas(id),
    FOREIGN KEY (estudante_id) REFERENCES Turmas(id)

);
CREATE TABLE AnoLetivo (
    id bigint GENERATED ALWAYS AS IDENTITY,
    Ano TEXT NOT NULL,
    serie INTEGER NOT NULL,

    CONSTRAINT pk_AnoLetivo PRIMARY KEY (id)
)
CREATE TABLE Entrada(
    PRIMARY KEY id INTEGER NOT NULL,
    data DATE NOT NULL,
    almoco INTEGER,

    CONSTRAINT pk_saida PRIMARY KEY (id),
    estudante_id INTEGER NOT NULL,
    FOREIGN KEY(estudante_id) REFERENCES Estudante(id)
);
CREATE TABLE Saida(
    PRIMARY KEY id INTEGER NOT NULL,
    FOREIGN KEY (estudante) REFERENCES Estudante(id),
    data DATE NOT NULL,

    CONSTRAINT pk_saida PRIMARY KEY (id),
    estudante_id INTEGER NOT NULL,
    FOREIGN KEY(estudante_id) REFERENCES Estudante(id)
    );
CREATE TABLE Ocorrencias(
    PRIMARY KEY id INTEGER NOT NULL,
    uniforme TEXT,
    atrasoa TEXT,
    comportamento TEXT,

    CONSTRAINT pk_saida PRIMARY KEY (id),
    estudante_id INTEGER NOT NULL,
    FOREIGN KEY(estudante_id) REFERENCES Estudante(id)
);
CREATE TABLE Visitante(
    PRIMARY KEY id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    nomeSocial TEXT,
    tipodeCadastrante TEXT NOT NULL,
    CPF TEXT NOT NULL,
    foto TEXT, 

    CONSTRAINT pk_visitante PRIMARY KEY (id)

);

DROP TABLE EXISTS IF EXISTS Funcionario;

CREATE TABLE Funcionario(
    id bigint GENERATED ALWAYS AS IDENTITY,
    login TEXT NOT NULL,
    senha TEXT NOT NULL,
    role TEXT NOT NULL,

    CONSTRAINT pk_funcionario PRIMARY KEY (id)
)
    



    -- CONSTRAINT ck_usuario_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'), -- formato de email com expressão regular
    -- CONSTRAINT ck_usuario_senha_length CHECK (length(senha) >= 6), -- comprimento mínimo
    -- CONSTRAINT ck_usuario_role_valid CHECK (role IN ( 'user')) -- tipos de usuário
