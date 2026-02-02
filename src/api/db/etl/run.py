import pandas as pd
from sqlalchemy import create_engine
import psycopg2

DB_HOST = 'localhost'
DB_NAME = 'cdcc'
DB_USER = 'cdcc'
DB_PASS = 'cdcc'
DB_PORT = '5432'

csv_file_path = 'alunos.csv'
csvFile = pd.read_csv(csv_file_path)

engine_string = f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(engine_string)

table_name = 'Notas'

try:
    csvFile.to_sql(
        table_name,
        con=engine,
        if_exists='replace', # Options: 'fail', 'replace', 'append'
        index=False,         # Do not write the DataFrame index as a column
        chunksize=1000       # Optional: Inserts data in batches for large files
    )
    print(f"Successfully loaded data into table '{table_name}'")
except Exception as e:
    print(f"Error loading data: {e}")