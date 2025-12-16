import { supabase } from '../utils/supabaseClient';
import { LeaderboardEntry } from '../types';

export const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('id, name, score, completed, created_at')
      .order('score', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    // Map Supabase response to our internal type
    // Convert ISO timestamp string to number for compatibility
    return (data || []).map((row: any) => ({
      id: row.id.toString(),
      name: row.name,
      score: row.score,
      completed: row.completed,
      date: new Date(row.created_at).getTime()
    }));
  } catch (err) {
    console.error('Unexpected error fetching leaderboard:', err);
    return [];
  }
};

export const submitScore = async (name: string, score: number, completed: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('leaderboard')
      .insert([
        { 
          name, 
          score, 
          completed,
          // created_at is handled by default value in DB
        }
      ]);

    if (error) {
      console.error('Error submitting score:', error);
    }
  } catch (err) {
    console.error('Unexpected error submitting score:', err);
  }
};
