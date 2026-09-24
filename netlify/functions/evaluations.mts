import { getDatabase } from "@netlify/database";
import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  const db = getDatabase();
  try {
    // Migração aditiva e idempotente: nunca remove colunas nem dados existentes.
    // Avaliações antigas recebem status "concluida" por padrão (nunca ficam "sumidas").
    await db.sql`ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'concluida'`;
    if (req.method === "GET") {
      const rows = await db.sql`
        SELECT id, employee_id AS "employeeId", role_id AS "roleId", period, evaluator,
               scores, status, created_at AS "createdAt"
        FROM evaluations ORDER BY created_at ASC
      `;
      return Response.json(rows);
    }
    if (req.method === "POST") {
      const body = await req.json();
      const status = body.status === "rascunho" ? "rascunho" : "concluida";
      const [row] = await db.sql`
        INSERT INTO evaluations (employee_id, role_id, period, evaluator, scores, status)
        VALUES (${body.employeeId}, ${body.roleId}, ${body.period || ""}, ${body.evaluator || ""}, ${JSON.stringify(body.scores || {})}::jsonb, ${status})
        RETURNING id, employee_id AS "employeeId", role_id AS "roleId", period, evaluator, scores, status, created_at AS "createdAt"
      `;
      return Response.json(row);
    }
    if (req.method === "PATCH") {
      const body = await req.json();
      if (!body.id) return new Response("missing id", { status: 400 });
      const [current]: any[] = await db.sql`SELECT * FROM evaluations WHERE id = ${body.id}`;
      if (!current) return new Response("not found", { status: 404 });
      const has = (k: string) => Object.prototype.hasOwnProperty.call(body, k);
      const period = has("period") ? body.period : current.period;
      const evaluator = has("evaluator") ? body.evaluator : current.evaluator;
      const scores = has("scores") ? body.scores : current.scores;
      const status = has("status") ? (body.status === "rascunho" ? "rascunho" : "concluida") : current.status;
      const [row] = await db.sql`
        UPDATE evaluations SET
          period = ${period || ""}, evaluator = ${evaluator || ""},
          scores = ${JSON.stringify(scores || {})}::jsonb, status = ${status}
        WHERE id = ${body.id}
        RETURNING id, employee_id AS "employeeId", role_id AS "roleId", period, evaluator, scores, status, created_at AS "createdAt"
      `;
      return Response.json(row);
    }
    if (req.method === "DELETE") {
      const id = new URL(req.url).searchParams.get("id");
      if (!id) return new Response("missing id", { status: 400 });
      await db.sql`DELETE FROM evaluations WHERE id = ${id}`;
      return Response.json({ ok: true });
    }
    return new Response("method not allowed", { status: 405 });
  } catch (err: any) {
    return new Response(String(err && err.message ? err.message : err), { status: 500 });
  }
};

export const config: Config = {
  path: "/api/evaluations",
};
