import db from './db';
import { timelineSchemaSql } from '../scripts/timeline-schema.mjs';

let schemaReady: Promise<unknown> | undefined;

export async function ensureTimelineSchema() {
  if (!schemaReady) {
    schemaReady = db.query(timelineSchemaSql).catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  }
  await schemaReady;
}
