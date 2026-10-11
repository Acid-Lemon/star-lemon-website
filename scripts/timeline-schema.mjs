// Shared by initialization, migrations, and timeline API requests.
export const timelineSchemaSql = `
CREATE TABLE IF NOT EXISTS timeline (
  id SERIAL PRIMARY KEY,
  date VARCHAR(7) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'milestone',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE timeline ADD COLUMN IF NOT EXISTS date VARCHAR(7);
ALTER TABLE timeline ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE timeline ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'timeline' AND column_name = 'year'
  ) THEN
    UPDATE timeline
    SET date = year::text || '-' || LPAD(COALESCE(month, 1)::text, 2, '0')
    WHERE date IS NULL;
    ALTER TABLE timeline ALTER COLUMN year DROP NOT NULL;
  END IF;
END $$;
ALTER TABLE timeline ALTER COLUMN date SET NOT NULL;
`;
