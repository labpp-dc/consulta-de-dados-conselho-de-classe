import pandas as pd
import json
from sqlalchemy import create_engine, text
from pathlib import Path

# =========================
# CONFIGURAÇÃO DO BANCO
# =========================

DB_HOST = 'localhost'
DB_NAME = 'cdcc'
DB_USER = 'cdcc'
DB_PASS = 'cdcc'
DB_PORT = '5432'

engine_string = f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(engine_string)

# =========================
# LEITURA DO CSV
# =========================

csv_file_path = 'alunos.csv'
df = pd.read_csv(csv_file_path)

# ================================================
# LEITURA DOS JSONs E INSERÇÂO DAS TURMAS NO BANCO
# ================================================

turmas = {}
turma_ids = {}

turmasJson = [p for p in Path('.').iterdir() if p.suffix == '.json']
for turma in turmasJson:
    with open(f'{turma}', 'r', encoding='utf-8') as f:
        turma_nome = turma.stem # remove ".json"
        turmas[turma_nome] = json.load(f)

        #if para discernir se a turma é do regular ou não regular
        if not turma_nome[0].isdigit():

            #if para discernir entre integrado e proeja
            if turma_nome[2].isdigit():
                turno = "noturno"
                serie = turma_nome[4]        # regra ainda indefinida
            else:
                turno = "integral"
                serie = int(turma_nome[2])
        else:
            turno = "matutino"
            serie = int(turma_nome[1])

        #Inserção das turmas utilizando os JSONs
        with engine.begin() as conn:
            result = conn.execute(
                text("INSERT INTO Turmas(nome, turno, serie) VALUES(:nome, :turno, :serie) RETURNING id"),
                {"nome":turma_nome, "turno": turno, "serie": serie}
            )

            turma_id = result.scalar()
            turma_ids[turma_nome] = turma_id
            
# =========================
# VALIDAÇÃO DAS COLUNAS
# =========================

expected_columns = {'nome', 'matricula', 'turma'}

for turma_cfg in turmas.values():
    for materia in turma_cfg['materia']:
        for notas in turma_cfg['notas']:
            expected_columns.add(f'{materia}_{notas}')

csv_columns = set(df.columns)

missing = expected_columns - csv_columns
extra = csv_columns - expected_columns

if missing:
    raise Exception(f'Colunas faltando no CSV: {missing}')

print(' CSV validado com sucesso contra os arquivos JSON')

# =========================
# INSERÇÃO NO POSTGRESQL
# =========================

materia_ids = {}

#Inserção de matérias

with engine.begin() as conn:
        
    for turma_nome, turma_cfg in turmas.items():
        turma_id = turma_ids.get(turma_nome)

        if turma_id is None:
            raise ValueError(f"Turma '{turma_nome}' não encontrada")

        for materia in turma_cfg['materia']:
            result = conn.execute(
                text("INSERT INTO Materia (nome, turma_id) VALUES (:nome, :turma_id) RETURNING id, nome, turma_id"), 
                {"nome":materia, "turma_id":turma_id}
            )
            materia_id = result.scalar()
            materia_ids[(turma_nome, materia)] = materia_id


estudante_ids = {}

#Inserção de Estudantes

with engine.begin() as conn:

    for _, row in df.iterrows():
        turma_nome = row['turma']
        turma_id = turma_ids.get(turma_nome)

        if turma_id is None:
            raise ValueError(f"Turma '{turma_nome}' não encontrada")

        result = conn.execute(
            text("INSERT INTO estudante(nome, nomeSocial, matricula, suspenso, foto, turma_id)VALUES (:nome, :nomeSocial, :matricula, :suspenso, :foto, :turma_id)RETURNING id, nome,nomeSocial, matricula, suspenso, foto, turma_id"),
            {"nome":row["nome"], "nomeSocial":row.get("nomeSocial"), "matricula":row["matricula"], "suspenso":row.get("suspenso"), "foto":row.get("foto"), "turma_id":turma_id}
        )

        estudante_id = result.scalar()
        estudante_ids[row["matricula"]] = estudante_id


#Inserção de Notas

with engine.begin() as conn:

    for _, row in df.iterrows():
        matriculaDeEstudante = row['matricula']
        estudante_id = estudante_ids.get(matriculaDeEstudante)

        turma_nome = row["turma"]
        turma_cfg = turmas[turma_nome]

        if estudante_id is None:
            raise ValueError(f"Estudante de matricula '{matriculaDeEstudante}' não encontrada")

        for materia in turma_cfg['materia']:
            
            materia_id = materia_ids.get((turma_nome, materia))
            cert1= row.get(f"{materia}_1c")
            apoio1= row.get(f"{materia}_1ca")
            cert2= row.get(f"{materia}_2c")
            apoio2= row.get(f"{materia}_2ca")
            pfv= row.get(f"{materia}_pfv")


            if materia_id is None:
                raise ValueError(f"Materia de nome '{materia}' não encontrada")
            

            result = conn.execute(
                text("INSERT INTO Notas(cert1, apoio1, cert2, apoio2, pfv, estudante_id, materia_id)VALUES (:cert1, :apoio1, :cert2, :apoio2, :pfv, :estudante_id, :materia_id)RETURNING id, cert1,apoio1, cert2, apoio2, pfv, estudante_id, materia_id"),
                {"cert1":cert1, "apoio1":apoio1, "cert2":cert2, "apoio2":apoio2, "pfv":pfv, "estudante_id":estudante_id, "materia_id":materia_id}
            )
