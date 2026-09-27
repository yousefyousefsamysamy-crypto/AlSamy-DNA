/* POST /api/submit
   بيستقبل نتيجة المتدرب أول ما يخلص، ويحطها في قاعدة البيانات.
   الجزء ده مفتوح من غير باسورد — لازم يكون كده، لأن المتدرب هو اللي بيبعت.
   عشان كده بيكتب بس، وعمره ما بيرجّع أي بيانات. */
import { json } from './_auth.js';

const MAX_BODY = 4 * 1024 * 1024;   // 4 ميجا — أكبر بكتير من أي تقرير حقيقي
const clamp = (v, n) => (v == null ? null : String(v).slice(0, n));

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: 'قاعدة البيانات مش مربوطة' }, 500);

  let body;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY) return json({ error: 'الملف أكبر من اللازم' }, 413);
    body = JSON.parse(raw);
  } catch (e) {
    return json({ error: 'بيانات غير صالحة' }, 400);
  }

  const rep = body && body.report;
  const emp = rep && rep.employee;
  const ses = rep && rep.session;
  const sco = rep && rep.score;
  // الحد الأدنى اللي لازم يكون موجود عشان الصف ده يبقى له معنى.
  if (!rep || !emp || !ses || !sco || !ses.sessionId || !emp.fullName) {
    return json({ error: 'بيانات ناقصة' }, 400);
  }

  const written = (rep.answers || []).filter(a => a && a.manualGrade).length;

  try {
    // INSERT OR REPLACE: لو المتدرب ضغط الزرار مرتين، نفس رقم الجلسة بيتحدّث
    // بدل ما يتسجل مرتين.
    await env.DB.prepare(
      `INSERT OR REPLACE INTO results
       (id, name, phone, address, started_at, completed_at, duration_s, attempt,
        percent, band, critical, written, report_json, report_html, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(
      clamp(ses.sessionId, 80),
      clamp(emp.fullName, 200),
      clamp(emp.phone, 40),
      clamp(emp.address, 300),
      clamp(ses.startedAt, 40),
      clamp(ses.completedAt, 40),
      Math.round(Number(ses.durationSeconds) || 0),
      Math.round(Number(ses.attemptNumber) || 1),
      Math.round(Number(sco.overallPercent) || 0),
      clamp(sco.band, 40),
      (sco.criticalFlags || []).length,
      written,
      JSON.stringify(rep),
      typeof body.html === 'string' ? body.html : null,
      new Date().toISOString()
    ).run();
  } catch (e) {
    return json({ error: 'ما قدرناش نحفظ النتيجة' }, 500);
  }

  return json({ ok: true });
}

// أي طريقة تانية غير POST مرفوضة — مفيش قراءة من هنا خالص.
export const onRequest = ({ request }) =>
  request.method === 'POST' ? undefined : json({ error: 'غير مسموح' }, 405);
