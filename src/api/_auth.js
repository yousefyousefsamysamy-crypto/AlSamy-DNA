/* التحقق من باسورد الإدارة — بيحصل هنا على السيرفر، مش في المتصفح.
   الباسورد نفسه بيتقرا من إعدادات Cloudflare (متغيّر اسمه ADMIN_PASSWORD)
   وعمره ما بينزل للمتصفح، فمفيش طريقة حد يقراه من صفحة الإدارة. */

/* مقارنة بتاخد نفس الوقت مهما كان الفرق، عشان محدش يعرف يخمّن الباسورد
   حرف حرف من الفرق في زمن الرد. */
function sameSecret(a, b) {
  const x = new TextEncoder().encode(String(a || ''));
  const y = new TextEncoder().encode(String(b || ''));
  let diff = x.length ^ y.length;
  const n = Math.max(x.length, y.length);
  for (let i = 0; i < n; i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
}

export function requireAdmin(request, env) {
  const given = request.headers.get('x-admin-key') || '';
  const want = env.ADMIN_PASSWORD || '';
  if (!want) {
    return new Response(JSON.stringify({ error: 'ADMIN_PASSWORD مش متظبط في إعدادات Cloudflare' }),
      { status: 500, headers: { 'content-type': 'application/json; charset=utf-8' } });
  }
  if (!sameSecret(given, want)) {
    return new Response(JSON.stringify({ error: 'الباسورد غلط' }),
      { status: 401, headers: { 'content-type': 'application/json; charset=utf-8' } });
  }
  return null;  // تمام
}

export const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  }
});
