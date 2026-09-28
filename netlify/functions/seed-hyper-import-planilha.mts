import { getDatabase } from "@netlify/database";
import type { Config } from "@netlify/functions";

// Endpoint de uso unico: atualiza colaboradores ja existentes (por id) com
// Data de Admissao, Salario, Aniversario e DISC (4 eixos) vindos da planilha
// "Colaboradores_Completo", e cadastra 1 colaborador que estava na planilha
// mas ainda nao existia na base (Isaque Oliveira Martins).
// Nao apaga nem sobrescreve nenhum outro dado. Migracao aditiva e idempotente.
// Protegido por confirmacao no corpo da requisicao para evitar disparo acidental.
// Remover este arquivo apos o uso (self-destruct manual).

const UPDATES: Array<{ id: string; admissionDate: string | null; salary: number | null; birthday: string | null; discD: number | null; discI: number | null; discS: number | null; discC: number | null }> = [
  { id: "b80aee07-0929-4fa3-9fcd-182235f6d925", admissionDate: "2024-10-01", salary: null, birthday: "2001-05-17", discD: null, discI: null, discS: null, discC: null },
  { id: "74f6b6bf-1d77-44ba-9e72-0a7f82320b55", admissionDate: "2024-10-01", salary: null, birthday: "2002-06-21", discD: null, discI: null, discS: null, discC: null },
  { id: "b0abc9c7-9585-4ce2-87d6-ca1e11cea5c7", admissionDate: "2025-11-03", salary: 22000.0, birthday: "1981-12-15", discD: null, discI: null, discS: null, discC: null },
  { id: "b8220c30-cc09-4743-85aa-ef3592dcbe2f", admissionDate: "2024-10-28", salary: 10000.0, birthday: "2003-08-25", discD: 35, discI: 10, discS: 50, discC: 68 },
  { id: "8c3f13a1-af42-49e3-9dc7-563b117b9912", admissionDate: "2026-06-22", salary: 10000.0, birthday: "2004-05-12", discD: 55, discI: 25, discS: 55, discC: 45 },
  { id: "a4786a71-17da-4262-b9c8-4c669ec85753", admissionDate: "2026-07-16", salary: 8500.0, birthday: "2001-01-10", discD: 55, discI: 52, discS: 35, discC: 45 },
  { id: "4b81f345-2ba0-404a-8da0-f85f767866ae", admissionDate: "2025-10-01", salary: 10000.0, birthday: "1993-10-24", discD: 30, discI: 10, discS: 62, discC: 58 },
  { id: "7b2df8b9-722e-46a0-a7d2-4ce5ff31c7fe", admissionDate: "2025-07-25", salary: 9000.0, birthday: "1996-12-18", discD: 50, discI: 45, discS: 52, discC: 50 },
  { id: "7beecc9d-da78-4575-82a8-80a11a4c8f67", admissionDate: "2025-08-04", salary: 5000.0, birthday: "2000-11-29", discD: 67, discI: 20, discS: 40, discC: 40 },
  { id: "56b75b54-37b3-4ea0-92c2-0fdadfc864a9", admissionDate: "2024-12-26", salary: 5000.0, birthday: "1998-07-21", discD: 55, discI: 10, discS: 45, discC: 60 },
  { id: "34f3958a-1b25-49d0-9eac-675d3e9676ab", admissionDate: "2026-02-09", salary: 4500.0, birthday: "1997-05-07", discD: 40, discI: 20, discS: 57, discC: 57 },
  { id: "50bb245f-1a6b-421d-b5a5-86f7f8779461", admissionDate: "2025-04-10", salary: 4500.0, birthday: "2003-09-17", discD: 25, discI: 40, discS: 70, discC: 25 },
  { id: "db94c830-2632-46ba-8de3-67e82a978d9d", admissionDate: "2025-09-23", salary: 11500.0, birthday: "1996-11-11", discD: 55, discI: 45, discS: 52, discC: 35 },
  { id: "4e07ef3a-0159-4bba-bf02-52be0ae39e80", admissionDate: "2026-05-01", salary: 5000.0, birthday: "2003-01-17", discD: 50, discI: 10, discS: 50, discC: 63 },
  { id: "b2c61dbc-afe8-4a65-9a31-aca1bcccae1e", admissionDate: "2025-01-28", salary: 5500.0, birthday: "1997-07-14", discD: 58, discI: 20, discS: 40, discC: 55 },
  { id: "d24cc411-9577-4db1-b898-78a18d1992c3", admissionDate: "2026-05-11", salary: 3500.0, birthday: "1999-09-27", discD: 45, discI: 10, discS: 50, discC: 65 },
  { id: "fa9aa301-6a5a-4e99-a6dc-0b77da46aec4", admissionDate: "2026-06-01", salary: 5000.0, birthday: "2003-02-09", discD: 58, discI: 5, discS: 60, discC: 40 },
  { id: "5fcb32d0-d33e-4ba1-8c42-3f607db4783d", admissionDate: "2026-06-01", salary: 3000.0, birthday: "2007-06-26", discD: 52, discI: 40, discS: 58, discC: 30 },
  { id: "da13002a-5094-4f9e-8aa9-88ee0da64271", admissionDate: "2026-06-08", salary: 4000.0, birthday: "2006-07-03", discD: 55, discI: 45, discS: 55, discC: 25 },
  { id: "8966de2c-d626-4626-8235-2907773de8e8", admissionDate: "2026-06-19", salary: 4000.0, birthday: "1998-09-02", discD: 58, discI: 30, discS: 45, discC: 50 },
  { id: "e77f0e36-8874-4b9b-8e54-1fe19913c586", admissionDate: "2026-07-01", salary: 3500.0, birthday: "2002-07-27", discD: 45, discI: 30, discS: 45, discC: 60 },
  { id: "da4b9daa-63e6-4956-b617-5e479f7a7dde", admissionDate: "2026-07-06", salary: 3000.0, birthday: "2003-01-12", discD: 40, discI: 57, discS: 57, discC: 20 },
  { id: "dc04e70c-fe7e-4367-b8fa-f73dc78eba78", admissionDate: "2026-07-14", salary: 3000.0, birthday: "2004-02-07", discD: null, discI: null, discS: null, discC: null },
  { id: "211d3cab-ee6c-467c-8276-1ba2bf17c430", admissionDate: "2026-07-24", salary: 5500.0, birthday: "1996-11-25", discD: 57, discI: 5, discS: 45, discC: 60 },
  { id: "6f595a2a-2ca3-4a7c-8739-6933e3c122ef", admissionDate: "2026-04-27", salary: 4500.0, birthday: "2002-08-04", discD: 40, discI: 20, discS: 57, discC: 57 },
  { id: "669339c2-289a-484d-a553-7e0566f9d67d", admissionDate: "2026-01-09", salary: 4750.0, birthday: "2000-05-05", discD: 52, discI: 45, discS: 55, discC: 35 },
  { id: "6fecdbd4-7d1d-488f-9365-a36602d2eb2c", admissionDate: "2026-09-01", salary: 3500.0, birthday: "2002-12-18", discD: 52, discI: 40, discS: 55, discC: 40 },
  { id: "96376c1d-c194-46fc-a72c-fe8fa970a3f3", admissionDate: "2026-05-08", salary: 3000.0, birthday: "2005-02-19", discD: 55, discI: 5, discS: 63, discC: 40 },
  { id: "20f3bb9c-df73-465b-8d12-8ab11ad2ab70", admissionDate: "2025-08-26", salary: 3500.0, birthday: "1996-01-09", discD: 15, discI: 30, discS: 52, discC: 67 },
];

// Colaborador presente na planilha mas ausente na base (cargo "CS" / area "CS" = Customer Success).
const NEW_EMPLOYEE = {
  roleId: "e7861023-056b-4d49-8a25-3d1fba543d66", // Customer Success (area CS)
  leaderId: "b80aee07-0929-4fa3-9fcd-182235f6d925", // Bruno Escobar (mesmo padrao dos demais colegas de CS)
  name: "Isaque Oliveira Martins",
  admissionDate: "2026-02-02",
  salary: 3500.0,
  birthday: "2000-02-16",
  discD: 30, discI: 25, discS: 80, discC: 5,
};

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });
  const db = getDatabase();
  try {
    const body = await req.json().catch(() => ({}));
    if (body.confirm !== "IMPORTAR_DADOS_PLANILHA_HYPER") {
      return new Response("confirmacao ausente ou incorreta", { status: 400 });
    }

    // Migração aditiva e idempotente: nunca remove colunas nem dados existentes.
    await db.sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS disc_d integer`;
    await db.sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS disc_i integer`;
    await db.sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS disc_s integer`;
    await db.sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS disc_c integer`;
    await db.sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS birthday date`;
    await db.sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS red_flag text`;

    let updated = 0;
    let notFound: string[] = [];
    for (const u of UPDATES) {
      const [current]: any[] = await db.sql`SELECT id FROM employees WHERE id = ${u.id}`;
      if (!current) { notFound.push(u.id); continue; }
      await db.sql`
        UPDATE employees SET
          admission_date = ${u.admissionDate},
          salary = ${u.salary},
          birthday = ${u.birthday},
          disc_d = ${u.discD}, disc_i = ${u.discI}, disc_s = ${u.discS}, disc_c = ${u.discC}
        WHERE id = ${u.id}
      `;
      updated++;
    }

    let created = false;
    const [existingByName]: any[] = await db.sql`SELECT id FROM employees WHERE name = ${NEW_EMPLOYEE.name}`;
    if (!existingByName) {
      await db.sql`
        INSERT INTO employees (role_id, name, status, leader_id, admission_date, salary, birthday, disc_d, disc_i, disc_s, disc_c)
        VALUES (${NEW_EMPLOYEE.roleId}, ${NEW_EMPLOYEE.name}, 'ativo', ${NEW_EMPLOYEE.leaderId}, ${NEW_EMPLOYEE.admissionDate}, ${NEW_EMPLOYEE.salary}, ${NEW_EMPLOYEE.birthday}, ${NEW_EMPLOYEE.discD}, ${NEW_EMPLOYEE.discI}, ${NEW_EMPLOYEE.discS}, ${NEW_EMPLOYEE.discC})
      `;
      created = true;
    }

    return Response.json({ ok: true, updated, notFound, created });
  } catch (err: any) {
    return new Response(String(err && err.message ? err.message : err), { status: 500 });
  }
};

export const config: Config = {
  path: "/api/admin/seed-hyper-import-planilha",
};
