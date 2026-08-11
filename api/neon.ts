import { Router, Request, Response } from 'express';
import { getSql, isDatabaseConfigured, testDbConnection } from '../server/db';
import { initDatabaseSchema } from '../server/schema';

const router = Router();

// =================================================================
// NEON POSTGRESQL API ROUTES (Express Router)
// =================================================================

// 1. Database Connection Status & Diagnostics
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = await testDbConnection();
    return res.json(status);
  } catch (error: any) {
    return res.status(500).json({
      connected: false,
      urlSet: isDatabaseConfigured(),
      message: `Database error: ${error?.message || String(error)}`
    });
  }
});

// 2. Trigger Schema Migration & Table Creation on-demand
router.post('/migrate', async (req: Request, res: Response) => {
  try {
    const result = await initDatabaseSchema();
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || String(error) });
  }
});

// 3. Fast Store Key-Value Persistence (Single Key)
router.get('/get-store/:key', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) {
    return res.status(400).json({ error: 'DATABASE_URL_MISSING', message: 'DATABASE_URL not configured' });
  }

  try {
    const sql = getSql();
    const rows = await sql`
      SELECT data, updated_at 
      FROM bsa_app_store 
      WHERE key = ${req.params.key}
    `;

    if (rows.length === 0) {
      return res.json({ found: false, data: null });
    }
    return res.json({ found: true, data: rows[0].data, updatedAt: rows[0].updated_at });
  } catch (err: any) {
    console.error(`[Neon DB] Error reading key ${req.params.key}:`, err);
    return res.status(500).json({ error: err.message });
  }
});

router.post('/set-store/:key', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) {
    return res.status(400).json({ error: 'DATABASE_URL_MISSING', message: 'DATABASE_URL not configured' });
  }

  try {
    const sql = getSql();
    const key = req.params.key;
    const bodyContent = req.body !== undefined ? req.body : null;
    const data = JSON.stringify(bodyContent);

    await sql`
      INSERT INTO bsa_app_store (key, data, updated_at)
      VALUES (${key}, ${data}::jsonb, NOW())
      ON CONFLICT (key)
      DO UPDATE SET data = ${data}::jsonb, updated_at = NOW();
    `;

    return res.json({ success: true, key });
  } catch (err: any) {
    console.error(`[Neon DB] Error saving key ${req.params.key}:`, err);
    return res.status(500).json({ error: err.message });
  }
});

// 4. Bulk Sync Entire Application State to Neon PostgreSQL
router.post('/bulk-sync', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) {
    return res.status(400).json({
      success: false,
      error: 'DATABASE_URL_MISSING',
      message: 'DATABASE_URL belum dikonfigurasi di Settings / Environment variables.'
    });
  }

  try {
    const sql = getSql();
    const payload = req.body || {};
    let syncedCount = 0;

    for (const [key, value] of Object.entries(payload)) {
      if (key === 'bsa_current_user') continue; // Sesi aktif browser tidak di-persist ke database global
      const jsonStr = JSON.stringify(value !== undefined ? value : null);

      await sql`
        INSERT INTO bsa_app_store (key, data, updated_at)
        VALUES (${key}, ${jsonStr}::jsonb, NOW())
        ON CONFLICT (key)
        DO UPDATE SET data = ${jsonStr}::jsonb, updated_at = NOW();
      `;
      syncedCount++;
    }

    return res.json({
      success: true,
      syncedKeys: syncedCount,
      message: `Semua data (${syncedCount} modul) berhasil disinkronkan ke database Neon PostgreSQL!`
    });
  } catch (err: any) {
    console.error('[Neon DB] Bulk sync failed:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Bulk Load All Application Data from Neon PostgreSQL
router.get('/bulk-load', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) {
    return res.status(400).json({ success: false, error: 'DATABASE_URL_MISSING' });
  }

  try {
    const sql = getSql();
    const rows = await sql`SELECT key, data, updated_at FROM bsa_app_store`;
    const resultObj: Record<string, any> = {};

    for (const row of rows) {
      resultObj[row.key] = row.data;
    }

    return res.json({ success: true, data: resultObj, count: rows.length });
  } catch (err: any) {
    console.error('[Neon DB] Bulk load failed:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =================================================================
// STRUCTURED ENTITY CRUD APIs (PostgreSQL Direct Queries)
// =================================================================

// USERS CRUD
router.get('/users', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return res.status(400).json({ error: 'DB_NOT_CONFIGURED' });
  try {
    const sql = getSql();
    const rows = await sql`SELECT * FROM bsa_users ORDER BY created_at DESC`;
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/users', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return res.status(400).json({ error: 'DB_NOT_CONFIGURED' });
  try {
    const sql = getSql();
    const u = req.body;
    const dataJson = JSON.stringify(u);

    await sql`
      INSERT INTO bsa_users (id, nis, username, name, email, role, class_name, phone, whatsapp, status, data, updated_at)
      VALUES (${u.id}, ${u.nis || null}, ${u.username || null}, ${u.name || ''}, ${u.email || ''}, ${u.role || 'student'}, ${u.className || null}, ${u.phone || null}, ${u.whatsapp || null}, ${u.status || 'ACTIVE'}, ${dataJson}::jsonb, NOW())
      ON CONFLICT (id)
      DO UPDATE SET
        nis = EXCLUDED.nis,
        username = EXCLUDED.username,
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        class_name = EXCLUDED.class_name,
        phone = EXCLUDED.phone,
        whatsapp = EXCLUDED.whatsapp,
        status = EXCLUDED.status,
        data = EXCLUDED.data,
        updated_at = NOW();
    `;
    return res.json({ success: true, data: u });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return res.status(400).json({ error: 'DB_NOT_CONFIGURED' });
  try {
    const sql = getSql();
    await sql`DELETE FROM bsa_users WHERE id = ${req.params.id}`;
    return res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// EXAMS CRUD
router.get('/exams', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return res.status(400).json({ error: 'DB_NOT_CONFIGURED' });
  try {
    const sql = getSql();
    const rows = await sql`SELECT * FROM bsa_exams ORDER BY created_at DESC`;
    return res.json({ success: true, data: rows.map(r => r.data || r) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/exams', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return res.status(400).json({ error: 'DB_NOT_CONFIGURED' });
  try {
    const sql = getSql();
    const ex = req.body;
    const dataJson = JSON.stringify(ex);

    await sql`
      INSERT INTO bsa_exams (id, title, exam_type, tryout_subtype, category, class_name, mode, data, updated_at)
      VALUES (${ex.id}, ${ex.title || ''}, ${ex.examType || null}, ${ex.tryoutSubType || null}, ${ex.category || null}, ${ex.targetClass || null}, ${ex.mode || null}, ${dataJson}::jsonb, NOW())
      ON CONFLICT (id)
      DO UPDATE SET
        title = EXCLUDED.title,
        exam_type = EXCLUDED.exam_type,
        tryout_subtype = EXCLUDED.tryout_subtype,
        category = EXCLUDED.category,
        class_name = EXCLUDED.class_name,
        mode = EXCLUDED.mode,
        data = EXCLUDED.data,
        updated_at = NOW();
    `;
    return res.json({ success: true, data: ex });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// EXAM RESULTS CRUD
router.get('/results', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return res.status(400).json({ error: 'DB_NOT_CONFIGURED' });
  try {
    const sql = getSql();
    const rows = await sql`SELECT * FROM bsa_results ORDER BY created_at DESC`;
    return res.json({ success: true, data: rows.map(r => r.data || r) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/results', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return res.status(400).json({ error: 'DB_NOT_CONFIGURED' });
  try {
    const sql = getSql();
    const resItem = req.body;
    const dataJson = JSON.stringify(resItem);

    await sql`
      INSERT INTO bsa_results (id, exam_id, student_id, student_name, exam_title, score, percentage, data, created_at)
      VALUES (${resItem.id}, ${resItem.examId || null}, ${resItem.studentId || null}, ${resItem.studentName || null}, ${resItem.examTitle || null}, ${resItem.score || 0}, ${resItem.percentage || 0}, ${dataJson}::jsonb, NOW())
      ON CONFLICT (id)
      DO UPDATE SET
        score = EXCLUDED.score,
        percentage = EXCLUDED.percentage,
        data = EXCLUDED.data;
    `;
    return res.json({ success: true, data: resItem });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// TEACHING JOURNALS CRUD
router.get('/journals', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return res.status(400).json({ error: 'DB_NOT_CONFIGURED' });
  try {
    const sql = getSql();
    const rows = await sql`SELECT * FROM bsa_teaching_journals ORDER BY meeting_number ASC, created_at DESC`;
    return res.json({ success: true, data: rows.map(r => r.data || r) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/journals', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return res.status(400).json({ error: 'DB_NOT_CONFIGURED' });
  try {
    const sql = getSql();
    const j = req.body;
    const dataJson = JSON.stringify(j);

    await sql`
      INSERT INTO bsa_teaching_journals (id, student_id, student_name, meeting_number, date, subtest_code, module_code, instructor_name, data, updated_at)
      VALUES (${j.id}, ${j.studentId || null}, ${j.studentName || null}, ${j.meetingNumber || 1}, ${j.date || null}, ${j.subtestCode || null}, ${j.moduleCode || null}, ${j.instructorName || null}, ${dataJson}::jsonb, NOW())
      ON CONFLICT (id)
      DO UPDATE SET
        student_id = EXCLUDED.student_id,
        student_name = EXCLUDED.student_name,
        meeting_number = EXCLUDED.meeting_number,
        date = EXCLUDED.date,
        subtest_code = EXCLUDED.subtest_code,
        module_code = EXCLUDED.module_code,
        instructor_name = EXCLUDED.instructor_name,
        data = EXCLUDED.data,
        updated_at = NOW();
    `;
    return res.json({ success: true, data: j });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
