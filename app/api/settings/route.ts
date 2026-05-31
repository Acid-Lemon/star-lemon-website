import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/db';
import { getSession } from '../../../lib/auth';
import { clearSettingsCache } from '../../../lib/settings';

export async function GET() {
  try {
    const result = await db.query('SELECT key, value, category, label FROM settings ORDER BY category, key');

    const grouped: Record<string, { key: string; value: string; label: string }[]> = {};
    result.rows.forEach((row: any) => {
      if (!grouped[row.category]) {
        grouped[row.category] = [];
      }
      grouped[row.category].push({
        key: row.key,
        value: row.value || '',
        label: row.label || row.key,
      });
    });

    return NextResponse.json(grouped);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    for (const [key, value] of Object.entries(body)) {
      const existing = await db.query('SELECT category, label FROM settings WHERE key = $1', [key]);
      const category = existing.rows.length > 0 ? existing.rows[0].category : 'site';
      const label = existing.rows.length > 0 ? existing.rows[0].label : key;

      await db.query(
        `INSERT INTO settings (key, value, category, label) VALUES ($1, $2, $3, $4)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
        [key, value, category, label]
      );
    }

    clearSettingsCache();

    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
