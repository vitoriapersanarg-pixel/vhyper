import { getDatabase } from "@netlify/database";
import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  const db = getDatabase();
  try {
    if (req.method === "GET") {
      const rows = await db.sql`
        SELECT id, role_id AS "roleId", candidate_id AS "candidateId", readiness, notes, created_at AS "createdAt"
        FROM succession ORDER BY created_at ASC
      `;
      return Response.json(rows);
    }
    if (req.method === "POST") {
      const body = await req.json();
      const [row] = await db.sql`
        INSERT INTO succession (role_id, candidate_id, readiness, notes)
        VALUES (${body.roleId}, ${body.candidateId}, ${body.readiness || "emergente"}, ${body.notes || ""})
        RETURNING id, role_id AS "roleId", candidate_id AS "candidateId", readiness, notes, created_at AS "createdAt"
      `;
      return Response.json(row);
    }
    if (req.method === "DELETE") {
      const id = new URL(req.url).searchParams.get("id");
      if (!id) return new Response("missing id", { status: 400 });
      await db.sql`DELETE FROM succession WHERE id = ${id}`;
      return Response.json({ ok: true });
    }
    return new Response("method not allowed", { status: 405 });
  } catch (err: any) {
    return new Response(String(err && err.message ? err.message : err), { status: 500 });
  }
};

export const config: Config = {
  path: "/api/succession",
};
