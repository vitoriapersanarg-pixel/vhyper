import { getDatabase } from "@netlify/database";
import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  const db = getDatabase();
  try {
    if (req.method === "GET") {
      const rows = await db.sql`
        SELECT
          id, role_id AS "roleId", name, status,
          leader_id AS "leaderId", admission_date AS "admissionDate", salary,
          disc_primary AS "discPrimary", disc_secondary AS "discSecondary",
          potential_score AS "potentialScore", pdi_status AS "pdiStatus",
          training_status AS "trainingStatus",
          onboarding_30 AS "onboarding30", onboarding_60 AS "onboarding60", onboarding_90 AS "onboarding90",
          highlight, created_at AS "createdAt"
        FROM employees ORDER BY created_at ASC
      `;
      return Response.json(rows);
    }
    if (req.method === "POST") {
      const body = await req.json();
      const [row] = await db.sql`
        INSERT INTO employees (
          role_id, name, status, leader_id, admission_date, salary,
          disc_primary, disc_secondary, potential_score, pdi_status, training_status,
          onboarding_30, onboarding_60, onboarding_90, highlight
        )
        VALUES (
          ${body.roleId}, ${body.name || ""}, ${body.status || "ativo"},
          ${body.leaderId || null}, ${body.admissionDate || null}, ${body.salary ?? null},
          ${body.discPrimary || null}, ${body.discSecondary || null}, ${body.potentialScore ?? null},
          ${body.pdiStatus || "nao_iniciado"}, ${body.trainingStatus || "nao_iniciado"},
          ${!!body.onboarding30}, ${!!body.onboarding60}, ${!!body.onboarding90}, ${!!body.highlight}
        )
        RETURNING
          id, role_id AS "roleId", name, status,
          leader_id AS "leaderId", admission_date AS "admissionDate", salary,
          disc_primary AS "discPrimary", disc_secondary AS "discSecondary",
          potential_score AS "potentialScore", pdi_status AS "pdiStatus",
          training_status AS "trainingStatus",
          onboarding_30 AS "onboarding30", onboarding_60 AS "onboarding60", onboarding_90 AS "onboarding90",
          highlight, created_at AS "createdAt"
      `;
      return Response.json(row);
    }
    if (req.method === "PATCH") {
      const body = await req.json();
      if (!body.id) return new Response("missing id", { status: 400 });
      const [current]: any[] = await db.sql`SELECT * FROM employees WHERE id = ${body.id}`;
      if (!current) return new Response("not found", { status: 404 });
      const has = (k: string) => Object.prototype.hasOwnProperty.call(body, k);
      const name = has("name") ? body.name : current.name;
      const roleId = has("roleId") ? body.roleId : current.role_id;
      const status = has("status") ? body.status : current.status;
      const leaderId = has("leaderId") ? body.leaderId : current.leader_id;
      const admissionDate = has("admissionDate") ? body.admissionDate : current.admission_date;
      const salary = has("salary") ? body.salary : current.salary;
      const discPrimary = has("discPrimary") ? body.discPrimary : current.disc_primary;
      const discSecondary = has("discSecondary") ? body.discSecondary : current.disc_secondary;
      const potentialScore = has("potentialScore") ? body.potentialScore : current.potential_score;
      const pdiStatus = has("pdiStatus") ? body.pdiStatus : current.pdi_status;
      const trainingStatus = has("trainingStatus") ? body.trainingStatus : current.training_status;
      const onboarding30 = has("onboarding30") ? !!body.onboarding30 : current.onboarding_30;
      const onboarding60 = has("onboarding60") ? !!body.onboarding60 : current.onboarding_60;
      const onboarding90 = has("onboarding90") ? !!body.onboarding90 : current.onboarding_90;
      const highlight = has("highlight") ? !!body.highlight : current.highlight;
      const [row] = await db.sql`
        UPDATE employees SET
          name = ${name}, role_id = ${roleId}, status = ${status},
          leader_id = ${leaderId || null}, admission_date = ${admissionDate || null}, salary = ${salary ?? null},
          disc_primary = ${discPrimary || null}, disc_secondary = ${discSecondary || null},
          potential_score = ${potentialScore ?? null}, pdi_status = ${pdiStatus || "nao_iniciado"},
          training_status = ${trainingStatus || "nao_iniciado"},
          onboarding_30 = ${onboarding30}, onboarding_60 = ${onboarding60}, onboarding_90 = ${onboarding90},
          highlight = ${highlight}
        WHERE id = ${body.id}
        RETURNING
          id, role_id AS "roleId", name, status,
          leader_id AS "leaderId", admission_date AS "admissionDate", salary,
          disc_primary AS "discPrimary", disc_secondary AS "discSecondary",
          potential_score AS "potentialScore", pdi_status AS "pdiStatus",
          training_status AS "trainingStatus",
          onboarding_30 AS "onboarding30", onboarding_60 AS "onboarding60", onboarding_90 AS "onboarding90",
          highlight, created_at AS "createdAt"
      `;
      return Response.json(row);
    }
    if (req.method === "DELETE") {
      const id = new URL(req.url).searchParams.get("id");
      if (!id) return new Response("missing id", { status: 400 });
      await db.sql`DELETE FROM employees WHERE id = ${id}`;
      return Response.json({ ok: true });
    }
    return new Response("method not allowed", { status: 405 });
  } catch (err: any) {
    return new Response(String(err && err.message ? err.message : err), { status: 500 });
  }
};

export const config: Config = {
  path: "/api/employees",
};
