/* مركز السامي — الـ Worker
   ده الكود اللي بيشتغل على السيرفر. بيعمل حاجتين:
     • أي طلب على /api/... بيتعامل معاه هنا
     • أي حاجة تانية بتترد من الملفات الثابتة (صفحة التدريب وصفحة الإدارة)

   ملاحظة: في نظام Workers، الملفات الثابتة بتترد قبل ما الكود ده يشتغل أصلًا،
   فالدالة دي عمرها ما بتتنده على صفحة موجودة — بتتنده على /api بس. */

import { onRequestPost as submit } from './api/submit.js';
import { onRequestGet as list } from './api/list.js';
import { onRequestGet as report } from './api/report.js';
import { json } from './api/_auth.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname.replace(/\/+$/, '') || '/';

    if (p === '/api/submit') {
      if (request.method !== 'POST') return json({ error: 'غير مسموح' }, 405);
      return submit({ request, env });
    }
    if (p === '/api/list') {
      if (request.method !== 'GET') return json({ error: 'غير مسموح' }, 405);
      return list({ request, env });
    }
    if (p === '/api/report') {
      if (request.method !== 'GET') return json({ error: 'غير مسموح' }, 405);
      return report({ request, env });
    }
    if (p.startsWith('/api/')) return json({ error: 'مفيش حاجة هنا' }, 404);

    // مش /api — رجّع الملف الثابت (بيحصل نادرًا، بس بيخلي السلوك مضمون)
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response('not found', { status: 404 });
  }
};
