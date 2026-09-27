/* GET /api/report?id=...       — التقرير التفاعلي كامل (HTML) لعرضه في الصفحة
   GET /api/report?id=...&raw=1 — نفس النتيجة كـ JSON لو حبيت تصدّرها
   الاتنين محميين بباسورد الإدارة. */
import { requireAdmin, json } from './_auth.js';

export async function onRequestGet({ request, env }) {
  const denied = requireAdmin(request, env);
  if (denied) return denied;
  if (!env.DB) return json({ error: 'قاعدة البيانات مش مربوطة' }, 500);

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return json({ error: 'رقم الجلسة ناقص' }, 400);

  const row = await env.DB.prepare(
    'SELECT report_json, report_html FROM results WHERE id = ?'
  ).bind(id).first();
  if (!row) return json({ error: 'مفيش نتيجة بالرقم ده' }, 404);

  if (new URL(request.url).searchParams.get('raw')) {
    return new Response(row.report_json, {
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
    });
  }
  return json({ html: row.report_html || '' });
}
