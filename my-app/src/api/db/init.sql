-- Script de inicialização automática do PostgreSQL
-- Este arquivo é executado automaticamente pelo Docker

-- Criar usuário da aplicação se não existir
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'elefantinho') THEN
      CREATE USER elefantinho WITH ENCRYPTED PASSWORD 'elefantinho';
   END IF;
END
$$;

-- Conceder permissões ao usuário no banco elefantinho
\c elefantinho;
GRANT ALL ON SCHEMA public TO elefantinho;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO elefantinho;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO elefantinho;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO elefantinho;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO elefantinho;
