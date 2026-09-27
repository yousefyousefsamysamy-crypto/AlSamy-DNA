/* GET /api/list  — قايمة كل المتدربين لصفحة الإدارة.
   محمية بباسورد الإدارة، وبترجّع الملخص بس من غير التقارير الكاملة عشان
   تفضل خفيفة حتى لو عندك مية نتيجة. */
import { requireAdmin, json } from './_auth.js';

export async function onRequestGet({ request, env }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  if (!env.DB) return json({ error: 'قاعدة البيانات مش مربوطة' }, 500);

  const { results } = await env.DB.prepare(
    `SELECT id, name, phone, address, completed_at, duration_s, attempt,
            percent, band, critical, written
     FROM results ORDER BY created_at DESC LIMIT 500`
  ).all();

  return json({ rows: results || [] });
}
