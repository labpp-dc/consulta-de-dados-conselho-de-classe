import pandas as pd
import json
from sqlalchemy import create_engine
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

# =========================
# LEITURA DOS JSONs
# =========================

turmas = {}

turmasJson = [p for p in Path('.').iterdir() if p.suffix == '.json']
for turma in turmasJson:
    with open(f'{turma}', 'r', encoding='utf-8') as f:
        turmas[f'TURMA_{turma}'] = json.load(f)

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
