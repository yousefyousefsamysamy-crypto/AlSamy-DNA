-- مركز السامي — جدول نتايج التدريب
-- شغّل الملف ده مرة واحدة بس، أول ما تعمل قاعدة البيانات.

CREATE TABLE IF NOT EXISTS results (
  id           TEXT PRIMARY KEY,        -- رقم الجلسة
  name         TEXT NOT NULL,
  phone        TEXT,
  address      TEXT,
  started_at   TEXT,
  completed_at TEXT,
  duration_s   INTEGER,
  attempt      INTEGER,
  percent      INTEGER,
  band         TEXT,
  critical     INTEGER,
  written      INTEGER,                 -- عدد الأسئلة المكتوبة اللي محتاجة تقييم يدوي
  report_json  TEXT NOT NULL,           -- النتيجة كاملة (المصدر الأصلي)
  report_html  TEXT,                    -- التقرير التفاعلي جاهز للعرض
  created_at   TEXT NOT NULL
);

-- الترتيب الافتراضي في صفحة الإدارة: الأحدث الأول.
CREATE INDEX IF NOT EXISTS results_created ON results (created_at DESC);
-- تجميع محاولات نفس الشخص.
CREATE INDEX IF NOT EXISTS results_phone   ON results (phone, created_at DESC);
