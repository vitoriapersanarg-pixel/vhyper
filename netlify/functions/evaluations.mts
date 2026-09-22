import { getDatabase } from "@netlify/database";
import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  const db = getDatabase();
  try {
    if (req.method === "GET") {
      const rows = await db.sql`
        SELECT id, employee_id AS "employeeId", role_id AS "roleId", period, evaluator,
               scores, created_at AS "createdAt"
        FROM evaluations ORDER BY created_at ASC
      `;
      return Response.json(rows);
    }
    if (req.method === "POST") {
      const body = await req.json();
      const [row] = await db.sql`
        INSERT INTO evaluations (employee_id, role_id, period, evaluator, scores)
        VALUES (${body.employeeId}, ${body.roleId}, ${body.period || ""}, ${body.evaluator || ""}, ${JSON.stringify(body.scores || {})}::jsonb)
        RETURNING id, employee_id AS "employeeId", role_id AS "roleId", period, evaluator, scores, created_at AS "createdAt"
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
