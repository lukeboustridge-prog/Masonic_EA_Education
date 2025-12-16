import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

export default async function handler(req: any, res: any) {
  try {
    // Lazy initialization: Ensure table exists
    // We use BIGINT for date to store JavaScript Date.now() timestamps
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leaderboard (
        id SERIAL PRIMARY KEY,
        player_name VARCHAR(50) NOT NULL,
        score INTEGER NOT NULL,
        completed BOOLEAN NOT NULL,
        created_at BIGINT NOT NULL
      );
    `);

    if (req.method === 'GET') {
      // Fetch top 100 recent entries to populate the lists
      // We limit to 100 to keep the payload light, but enough to fill 'Top' and 'Recent'
      const result = await pool.query('SELECT * FROM leaderboard ORDER BY created_at DESC LIMIT 100');
      
      const entries = result.rows.map((row: any) => ({
        id: row.id.toString(),
        name: row.player_name,
        score: row.score,
        date: Number(row.created_at),
        completed: row.completed
      }));
      
      return res.status(200).json(entries);
    }

    if (req.method === 'POST') {
      const { name, score, completed, date } = req.body;

      if (!name || typeof score !== 'number') {
        return res.status(400).json({ error: 'Invalid payload' });
      }

      await pool.query(
        'INSERT INTO leaderboard (player_name, score, completed, created_at) VALUES ($1, $2, $3, $4)',
        [name, score, completed, date]
      );

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}