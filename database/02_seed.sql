-- =============================================================================
-- SISTEMA ÓTICA — Seed de Dados Iniciais
-- Baseado nos mocks do AppContext.jsx
-- Execute APÓS o script 01_schema.sql
-- =============================================================================
-- ATENÇÃO: CPFs neste seed são fictícios (não passam em validação de dígito).
-- Substitua por dados reais em produção.
-- =============================================================================

BEGIN;

-- ===========================================================================
-- PACIENTES
-- UUIDs fixos para permitir referência determinística nos INSERTs seguintes.
-- ===========================================================================

INSERT INTO pacientes (id, nome, cpf, data_nascimento, telefone, criado_em, atualizado_em)
VALUES
    (
        'a1b2c3d4-0001-0000-0000-000000000001',
        'Ana Clara Souza',
        '123.456.789-00',
        '1990-03-15',
        '(11) 98765-4321',
        now(), now()
    ),
    (
        'a1b2c3d4-0002-0000-0000-000000000002',
        'Roberto Ferreira Lima',
        '987.654.321-00',
        '1972-07-22',
        '(11) 91234-5678',
        now(), now()
    ),
    (
        'a1b2c3d4-0003-0000-0000-000000000003',
        'Juliana Martins Costa',
        '111.222.333-44',
        '1996-11-08',
        '(11) 99876-5432',
        now(), now()
    ),
    (
        'a1b2c3d4-0004-0000-0000-000000000004',
        'Carlos Eduardo Pereira',
        '555.666.777-88',
        '1979-01-30',
        '(11) 97654-3210',
        now(), now()
    )
ON CONFLICT (id) DO NOTHING;


-- ===========================================================================
-- FICHAS
-- ===========================================================================

INSERT INTO fichas (
    id,
    paciente_id,
    data_atendimento,
    tipo_atendimento,
    observacao_recepcao,
    precisa_colicario,
    status,
    criado_em,
    atualizado_em
)
VALUES
    -- f1: Ana Clara — hoje, aguardando (com colírio)
    (
        'b1c2d3e4-0001-0000-0000-000000000001',
        'a1b2c3d4-0001-0000-0000-000000000001',
        CURRENT_DATE,
        'Primeira Consulta',
        'Paciente relatou dor de cabeça constante ao ler.',
        TRUE,
        'aguardando',
        now(), now()
    ),
    -- f2: Roberto — hoje, aguardando (sem colírio)
    (
        'b1c2d3e4-0002-0000-0000-000000000002',
        'a1b2c3d4-0002-0000-0000-000000000002',
        CURRENT_DATE,
        'Retorno',
        'Trouxe óculos antigo para avaliação. Reclama que está errando leituras.',
        FALSE,
        'aguardando',
        now(), now()
    ),
    -- f3: Juliana — hoje, em atendimento
    (
        'b1c2d3e4-0003-0000-0000-000000000003',
        'a1b2c3d4-0003-0000-0000-000000000003',
        CURRENT_DATE,
        'Garantia/Ajuste',
        'Armação torta, incomoda atrás da orelha esquerda.',
        FALSE,
        'em_atendimento',
        now(), now()
    ),
    -- f4: Carlos — ontem, finalizado (com colírio)
    (
        'b1c2d3e4-0004-0000-0000-000000000004',
        'a1b2c3d4-0004-0000-0000-000000000004',
        CURRENT_DATE - INTERVAL '1 day',
        'Acompanhamento',
        'Consulta de rotina anual.',
        TRUE,
        'finalizado',
        now() - INTERVAL '1 day',
        now() - INTERVAL '1 day'
    ),
    -- f5: Ana Clara — histórica (2025), finalizado (com colírio)
    (
        'b1c2d3e4-0005-0000-0000-000000000005',
        'a1b2c3d4-0001-0000-0000-000000000001',
        '2025-09-10',
        'Primeira Consulta',
        'Veio por indicação. Nunca usou óculos.',
        TRUE,
        'finalizado',
        '2025-09-10 09:00:00+00',
        '2025-09-10 11:30:00+00'
    ),
    -- f6: Roberto — histórica (2025), finalizado (sem colírio)
    (
        'b1c2d3e4-0006-0000-0000-000000000006',
        'a1b2c3d4-0002-0000-0000-000000000002',
        '2025-11-20',
        'Primeira Consulta',
        'Paciente com dificuldade de enxergar de longe.',
        FALSE,
        'finalizado',
        '2025-11-20 08:30:00+00',
        '2025-11-20 10:00:00+00'
    )
ON CONFLICT (id) DO NOTHING;


-- ===========================================================================
-- LAUDOS
-- Apenas fichas com status = 'finalizado' possuem laudo.
-- f1, f2, f3 são fichas abertas/em andamento → sem laudo (correto).
-- ===========================================================================

INSERT INTO laudos (
    id,
    ficha_id,
    od_esferico,
    od_cilindrico,
    od_eixo,
    oe_esferico,
    oe_cilindrico,
    oe_eixo,
    observacao_medica,
    proxima_consulta,
    criado_em,
    atualizado_em
)
VALUES
    -- l1: Laudo de Carlos (f4 — ontem)
    (
        'c1d2e3f4-0001-0000-0000-000000000001',
        'b1c2d3e4-0004-0000-0000-000000000004',
        -2.00,
        -0.50,
        180,
        -1.75,
        -0.75,
        175,
        'Miopia leve. Recomendo uso contínuo dos óculos e retorno em 12 meses.',
        CURRENT_DATE + INTERVAL '1 year' - INTERVAL '1 day', -- retorno em ~1 ano
        now() - INTERVAL '1 day',
        now() - INTERVAL '1 day'
    ),
    -- l2: Laudo de Ana Clara (f5 — 2025, retorno JÁ VENCIDO para testar alerta)
    (
        'c1d2e3f4-0002-0000-0000-000000000002',
        'b1c2d3e4-0005-0000-0000-000000000005',
        -1.50,
         0.00,
           0,
        -1.25,
        -0.25,
          90,
        'Miopia leve bilateral. Primeira prescrição. Orientada sobre o uso e adaptação dos óculos.',
        '2026-09-10', -- data passada → alerta "Retorno vencido" no front
        '2025-09-10 11:30:00+00',
        '2025-09-10 11:30:00+00'
    ),
    -- l3: Laudo de Roberto (f6 — 2025, retorno próximo para testar alerta âmbar)
    (
        'c1d2e3f4-0003-0000-0000-000000000003',
        'b1c2d3e4-0006-0000-0000-000000000006',
        -3.00,
        -1.00,
        170,
        -2.75,
        -0.50,
        165,
        'Miopia moderada. Prescrição de óculos para uso permanente.',
        '2026-11-20', -- retorno em nov/26 → alerta âmbar se < 30 dias
        '2025-11-20 10:00:00+00',
        '2025-11-20 10:00:00+00'
    )
ON CONFLICT (id) DO NOTHING;


COMMIT;


-- ===========================================================================
-- CONSULTAS DE VERIFICAÇÃO
-- Execute após o seed para confirmar a carga.
-- ===========================================================================

-- Contagem geral
SELECT 'pacientes' AS tabela, COUNT(*) AS total FROM pacientes
UNION ALL
SELECT 'fichas',  COUNT(*) FROM fichas
UNION ALL
SELECT 'laudos',  COUNT(*) FROM laudos;

-- Visão integrada: paciente + ficha + laudo (equivale ao que o front monta)
SELECT
    p.nome                          AS paciente,
    p.cpf,
    f.data_atendimento,
    f.tipo_atendimento,
    f.status,
    f.precisa_colicario             AS colicario,
    l.od_esferico,
    l.od_cilindrico,
    l.od_eixo,
    l.oe_esferico,
    l.oe_cilindrico,
    l.oe_eixo,
    l.proxima_consulta
FROM pacientes p
JOIN fichas    f ON f.paciente_id = p.id
LEFT JOIN laudos l ON l.ficha_id = f.id
ORDER BY p.nome, f.data_atendimento DESC;

-- Fila de atendimento do dia (consulta do doutor)
SELECT
    p.nome,
    f.tipo_atendimento,
    f.status,
    f.precisa_colicario,
    f.observacao_recepcao
FROM fichas f
JOIN pacientes p ON p.id = f.paciente_id
WHERE f.data_atendimento = CURRENT_DATE
  AND f.status IN ('aguardando', 'em_atendimento')
ORDER BY f.criado_em;

-- Pacientes com retorno vencido
SELECT
    p.nome,
    p.telefone,
    l.proxima_consulta,
    (CURRENT_DATE - l.proxima_consulta) AS dias_vencido
FROM laudos l
JOIN fichas    f ON f.id = l.ficha_id
JOIN pacientes p ON p.id = f.paciente_id
WHERE l.proxima_consulta < CURRENT_DATE
ORDER BY l.proxima_consulta;
