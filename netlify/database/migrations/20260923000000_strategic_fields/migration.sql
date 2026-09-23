-- Strategic HR fields on employees + roles, and new aggregate-view tables

ALTER TABLE employees ADD COLUMN IF NOT EXISTS leader_id UUID REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS admission_date DATE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS salary NUMERIC(12,2);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS disc_primary TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS disc_secondary TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS potential_score INTEGER;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS pdi_status TEXT DEFAULT 'nao_iniciado';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS training_status TEXT DEFAULT 'nao_iniciado';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS onboarding_30 BOOLEAN DEFAULT false;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS onboarding_60 BOOLEAN DEFAULT false;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS onboarding_90 BOOLEAN DEFAULT false;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS highlight BOOLEAN DEFAULT false;

ALTER TABLE roles ADD COLUMN IF NOT EXISTS critical BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS climate_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dimension TEXT NOT NULL,
  score NUMERIC NOT NULL,
  period TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS succession (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  readiness TEXT DEFAULT 'emergente',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

