-- =============================================================================
-- SISTEMA ÓTICA — DDL Schema
-- PostgreSQL 15+ / Supabase
-- =============================================================================
-- Ordem de criação: PACIENTES → FICHAS → LAUDOS
-- Executar como uma única transação para garantir atomicidade.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Extensão para geração de UUIDs (já habilitada no Supabase por padrão)
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ===========================================================================
-- TIPOS ENUMERADOS
-- Usar ENUMs garante integridade no banco, independente da validação do front.
-- ===========================================================================

-- Status do ciclo de vida de uma ficha
CREATE TYPE status_ficha AS ENUM (
    'aguardando',
    'em_atendimento',
    'finalizado'
);

-- Tipo de visita/atendimento
CREATE TYPE tipo_atendimento AS ENUM (
    'Primeira Consulta',
    'Retorno',
    'Acompanhamento',
    'Garantia/Ajuste'
);


-- ===========================================================================
-- TABELA: pacientes
-- Dados cadastrais do paciente. Gerenciados pela recepção.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS pacientes (
    -- Chave primária UUID gerada pelo banco
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Dados pessoais
    nome                VARCHAR(255)    NOT NULL
                            CONSTRAINT chk_paciente_nome_nao_vazio
                            CHECK (trim(nome) <> ''),

    cpf                 CHAR(14)        NOT NULL UNIQUE
                            CONSTRAINT chk_cpf_formato
                            CHECK (cpf ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$'),

    data_nascimento     DATE            NOT NULL
                            CONSTRAINT chk_data_nascimento_passado
                            CHECK (data_nascimento < CURRENT_DATE),

    telefone            VARCHAR(20)     NOT NULL
                            CONSTRAINT chk_telefone_nao_vazio
                            CHECK (trim(telefone) <> ''),

    -- Auditoria
    criado_em           TIMESTAMPTZ     NOT NULL DEFAULT now(),
    atualizado_em       TIMESTAMPTZ     NOT NULL DEFAULT now()
);

COMMENT ON TABLE  pacientes                 IS 'Cadastro de pacientes da ótica.';
COMMENT ON COLUMN pacientes.cpf             IS 'CPF no formato 000.000.000-00. Único por paciente.';
COMMENT ON COLUMN pacientes.data_nascimento IS 'Usada para calcular a idade no front-end (não armazenamos idade derivada).';


-- ===========================================================================
-- TABELA: fichas
-- Representa uma visita/atendimento criado pela recepção.
-- Cada ficha pertence a um paciente (N:1) e tem exatamente 0 ou 1 laudo.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS fichas (
    id                      UUID                PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relacionamento com paciente (DELETE CASCADE: se o paciente for removido,
    -- suas fichas são removidas junto — decisão válida para uma ótica pequena)
    paciente_id             UUID                NOT NULL
                                REFERENCES pacientes (id)
                                ON DELETE CASCADE
                                ON UPDATE CASCADE,

    -- Dados da visita
    data_atendimento        DATE                NOT NULL DEFAULT CURRENT_DATE,

    tipo_atendimento        tipo_atendimento    NOT NULL,

    observacao_recepcao     TEXT,

    -- Flag de triagem: paciente precisa de colírio para dilatar a pupila
    precisa_colicario       BOOLEAN             NOT NULL DEFAULT FALSE,

    -- Controle de fila
    status                  status_ficha        NOT NULL DEFAULT 'aguardando',

    -- Auditoria
    criado_em               TIMESTAMPTZ         NOT NULL DEFAULT now(),
    atualizado_em           TIMESTAMPTZ         NOT NULL DEFAULT now()
);

COMMENT ON TABLE  fichas                        IS 'Ficha de atendimento aberta pela recepção. Representa uma visita à ótica.';
COMMENT ON COLUMN fichas.precisa_colicario      IS 'Indica se o paciente deve receber colírio midriático antes da consulta.';
COMMENT ON COLUMN fichas.status                 IS 'Ciclo: aguardando → em_atendimento → finalizado.';
COMMENT ON COLUMN fichas.observacao_recepcao    IS 'Texto livre preenchido pela atendente antes da consulta.';


-- ===========================================================================
-- TABELA: laudos
-- Prescrição médica preenchida pelo doutor/optometrista.
-- Relação 1:1 com fichas (UNIQUE em ficha_id).
-- ===========================================================================

CREATE TABLE IF NOT EXISTS laudos (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relação 1:1 com ficha — UNIQUE garante que não existam dois laudos
    -- para a mesma ficha. DELETE CASCADE: laudo sem ficha não faz sentido.
    ficha_id            UUID            NOT NULL UNIQUE
                            REFERENCES fichas (id)
                            ON DELETE CASCADE
                            ON UPDATE CASCADE,

    -- ── Olho Direito (OD) ──────────────────────────────────────────────────
    -- NUMERIC(5,2): permite de -99.99 a +99.99 (suficiente para graduações)
    od_esferico         NUMERIC(5,2)    NOT NULL,
    od_cilindrico       NUMERIC(5,2)    NOT NULL,
    -- Eixo em graus: 0 a 180 (convenção clínica)
    od_eixo             SMALLINT        NOT NULL
                            CONSTRAINT chk_od_eixo
                            CHECK (od_eixo >= 0 AND od_eixo <= 180),

    -- ── Olho Esquerdo (OE) ─────────────────────────────────────────────────
    oe_esferico         NUMERIC(5,2)    NOT NULL,
    oe_cilindrico       NUMERIC(5,2)    NOT NULL,
    oe_eixo             SMALLINT        NOT NULL
                            CONSTRAINT chk_oe_eixo
                            CHECK (oe_eixo >= 0 AND oe_eixo <= 180),

    -- ── Informações clínicas ───────────────────────────────────────────────
    observacao_medica   TEXT,

    -- Data sugerida para retorno (preenchida pelo doutor, opcional)
    proxima_consulta    DATE,

    -- Auditoria
    criado_em           TIMESTAMPTZ     NOT NULL DEFAULT now(),
    atualizado_em       TIMESTAMPTZ     NOT NULL DEFAULT now()
);

COMMENT ON TABLE  laudos                    IS 'Laudo de refração emitido pelo doutor/optometrista. Relação 1:1 com ficha.';
COMMENT ON COLUMN laudos.od_esferico        IS 'Graduação esférica do olho direito (ex: -2.00, +1.50).';
COMMENT ON COLUMN laudos.od_cilindrico      IS 'Graduação cilíndrica do olho direito (ex: -0.50).';
COMMENT ON COLUMN laudos.od_eixo            IS 'Eixo do cilindro do olho direito em graus (0–180).';
COMMENT ON COLUMN laudos.oe_esferico        IS 'Graduação esférica do olho esquerdo.';
COMMENT ON COLUMN laudos.oe_cilindrico      IS 'Graduação cilíndrica do olho esquerdo.';
COMMENT ON COLUMN laudos.oe_eixo            IS 'Eixo do cilindro do olho esquerdo em graus (0–180).';
COMMENT ON COLUMN laudos.proxima_consulta   IS 'Data de retorno sugerida pelo doutor. Usada para alertas no histórico.';


-- ===========================================================================
-- ÍNDICES
-- Criados para cobrir os padrões de consulta mais frequentes do sistema.
-- ===========================================================================

-- Busca de paciente por CPF (tela de recepção — busca por CPF)
CREATE UNIQUE INDEX IF NOT EXISTS idx_pacientes_cpf
    ON pacientes (cpf);

-- Busca de paciente por nome (busca textual — tela de recepção)
CREATE INDEX IF NOT EXISTS idx_pacientes_nome
    ON pacientes USING gin (to_tsvector('portuguese', nome));

-- Histórico de fichas de um paciente (tela de histórico — consulta mais comum)
CREATE INDEX IF NOT EXISTS idx_fichas_paciente_id
    ON fichas (paciente_id);

-- Fila de atendimento do dia (tela do doutor — filtra por data + status)
CREATE INDEX IF NOT EXISTS idx_fichas_data_status
    ON fichas (data_atendimento, status);

-- Fichas em aberto para a fila do doutor (parcial — só registros ativos)
CREATE INDEX IF NOT EXISTS idx_fichas_aguardando
    ON fichas (data_atendimento, criado_em)
    WHERE status = 'aguardando';

-- Lookup de laudo por ficha (já coberto pelo UNIQUE, mas explicitando)
CREATE INDEX IF NOT EXISTS idx_laudos_ficha_id
    ON laudos (ficha_id);

-- Alerta de retorno vencido (consultas futuras: proxima_consulta <= hoje)
CREATE INDEX IF NOT EXISTS idx_laudos_proxima_consulta
    ON laudos (proxima_consulta)
    WHERE proxima_consulta IS NOT NULL;


-- ===========================================================================
-- TRIGGER: atualiza o campo atualizado_em automaticamente
-- ===========================================================================

CREATE OR REPLACE FUNCTION fn_set_atualizado_em()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_pacientes_atualizado_em
    BEFORE UPDATE ON pacientes
    FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

CREATE OR REPLACE TRIGGER trg_fichas_atualizado_em
    BEFORE UPDATE ON fichas
    FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

CREATE OR REPLACE TRIGGER trg_laudos_atualizado_em
    BEFORE UPDATE ON laudos
    FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();


-- ===========================================================================
-- ROW LEVEL SECURITY (RLS) — Base para integração com Supabase Auth
-- Habilitado mas sem políticas restritivas por enquanto.
-- Descomente e adapte ao adicionar autenticação real de usuários.
-- ===========================================================================

ALTER TABLE pacientes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE laudos      ENABLE ROW LEVEL SECURITY;

-- Política permissiva temporária: permite tudo para usuários autenticados.
-- SUBSTITUA por políticas baseadas em roles (recepcao / doutor) ao implementar auth.
CREATE POLICY "acesso_autenticado_pacientes"
    ON pacientes FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "acesso_autenticado_fichas"
    ON fichas FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "acesso_autenticado_laudos"
    ON laudos FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);


COMMIT;
