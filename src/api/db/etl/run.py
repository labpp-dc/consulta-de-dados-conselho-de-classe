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
        turmas[f'TURMA_{turma}'] = json.load(f)

        turma_nome = turma.stem # remove ".json"

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

with engine.begin() as conn:

    for _, row in df.iterrows():
        turma_nome = row['turma']
        turma_id = turma_ids.get(turma_nome)

        if turma_id is None:
            raise ValueError(f"Turma '{turma_nome}' não encontrada")

    conn.execute(
        text("INSERT INTO estudante(nome, nomeSocial, matricula, suspenso, foto, turma_id)VALUES (:nome, :nomeSocial, :matricula, :suspenso, :foto, :turma_id)RETURNING id, nome,nomeSocial, matricula, suspenso, foto, turma_id"),
        {"nome":row["nome"], "nomeSocial":row.get("nomeSocial"), "matricula":row["matricula"], "suspenso":row.get("suspenso"), "foto":row.get("foto"), "turma_id":turma_id}
    )
 

table_name = 'notas'

try:
    df.to_sql(
        table_name,
        con=engine,
        if_exists='replace',
        index=False,
        chunksize=1000
    )
    print(f" Dados carregados com sucesso na tabela '{table_name}'")
except Exception as e:
    print(f" Erro ao carregar dados: {e}")
