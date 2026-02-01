import { query } from '../../config/postgres.js';

export async function up() {
  const sql = `
    -- Events table
    CREATE TABLE events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      brand VARCHAR(100) DEFAULT 'Wrestling',
      date TIMESTAMP NOT NULL,
      locked BOOLEAN DEFAULT FALSE,
      scored BOOLEAN DEFAULT FALSE,
      scored_at TIMESTAMP DEFAULT NULL,
      created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_events_date ON events(date DESC);
    CREATE INDEX idx_events_locked ON events(locked);
    CREATE INDEX idx_events_scored ON events(scored);
    CREATE INDEX idx_events_created_by ON events(created_by);

    CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- Matches table
    CREATE TABLE matches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      match_id VARCHAR(50) NOT NULL,
      match_type VARCHAR(50) DEFAULT 'Singles',
      title_match BOOLEAN DEFAULT FALSE,
      competitors TEXT[] NOT NULL,
      winner VARCHAR(255) DEFAULT NULL,
      multiplier DECIMAL(3, 2) DEFAULT 1.0,
      match_order INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(event_id, match_id)
    );

    CREATE INDEX idx_matches_event_id ON matches(event_id);
    CREATE INDEX idx_matches_event_order ON matches(event_id, match_order);

    -- Picks table
    CREATE TABLE picks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      total_confidence INTEGER NOT NULL CHECK (total_confidence = 100),
      version INTEGER DEFAULT 2,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(event_id, user_id)
    );

    CREATE INDEX idx_picks_event_id ON picks(event_id);
    CREATE INDEX idx_picks_user_id ON picks(user_id);

    CREATE TRIGGER update_picks_updated_at BEFORE UPDATE ON picks
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- Pick choices table
    CREATE TABLE pick_choices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      pick_id UUID NOT NULL REFERENCES picks(id) ON DELETE CASCADE,
      match_id VARCHAR(50) NOT NULL,
      winner VARCHAR(255) NOT NULL,
      confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(pick_id, match_id)
    );

    CREATE INDEX idx_pick_choices_pick_id ON pick_choices(pick_id);
  `;

  await query(sql);
  console.log('Events and picks tables created successfully');
}

export async function down() {
  await query('DROP TABLE IF EXISTS pick_choices CASCADE');
  await query('DROP TABLE IF EXISTS picks CASCADE');
  await query('DROP TABLE IF EXISTS matches CASCADE');
  await query('DROP TABLE IF EXISTS events CASCADE');
  console.log('Events and picks tables dropped');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const action = process.argv[2] || 'up';

  if (action === 'up') {
    await up();
  } else if (action === 'down') {
    await down();
  }

  process.exit(0);
}
