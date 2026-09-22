CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  area TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  type TEXT NOT NULL,
  weight INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  evaluator TEXT,
  scores JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed: starter role with the Programa Excelência Hyper criteria already applied
INSERT INTO roles (id, name, area, notes)
VALUES ('00000000-0000-0000-0000-000000000001', 'Geral (Programa Excelência)', '', 'Função de exemplo com os critérios do Programa Excelência já aplicados. Edite o nome, crie funções específicas do seu time, ou exclua esta se preferir.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO criteria (role_id, name, category, type, weight, description) VALUES
('00000000-0000-0000-0000-000000000001','Qualidade e consistência dos dados/entregas','Programa Excelência','scale',3,'Precisão, padronização e confiabilidade do que é entregue'),
('00000000-0000-0000-0000-000000000001','Iniciativa em melhoria de processos','Programa Excelência','scale',3,'Propôs e aplicou uma melhoria de processo no período'),
('00000000-0000-0000-0000-000000000001','Cumprimento de prazos e metas','Programa Excelência','scale',3,'Entregou dentro do prazo combinado'),
('00000000-0000-0000-0000-000000000001','Colaboração e apoio à equipe','Programa Excelência','scale',3,'Trabalho em equipe, troca de conhecimento, apoio a colegas'),
('00000000-0000-0000-0000-000000000001','Compartilhamento de conhecimento','Programa Excelência','scale',2,'Mentoria, treinamento de alguém ou documentação de processo'),
('00000000-0000-0000-0000-000000000001','Zero atrasos/faltas não justificadas','Programa Excelência','bool',1,'Assiduidade no período avaliado'),
('00000000-0000-0000-0000-000000000001','Não gerou retrabalho por erro evitável','Programa Excelência','bool',2,'Qualidade de dados/processos sem reincidência de erro já apontado'),
('00000000-0000-0000-0000-000000000001','Postura colaborativa com o time','Programa Excelência','bool',2,'Não reteve informação nem atrapalhou o trabalho coletivo'),
('00000000-0000-0000-0000-000000000001','Observações do avaliador','Programa Excelência','texto',1,'Destaques e pontos de atenção do período');
