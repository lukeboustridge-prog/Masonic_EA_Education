import { supabase } from '../utils/supabaseClient';
import { LeaderboardEntry } from '../types';

// CONFIGURATION
const MAIN_APP_URL = import.meta.env.VITE_MAIN_APP_URL as string | undefined;
const GAME_API_SECRET = import.meta.env.VITE_GAME_API_SECRET as string | undefined;
const GAME_SLUG = import.meta.env.VITE_GAME_SLUG as string | undefined;

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

export const submitScore = async (name: string, score: number, completed: boolean, userId?: string | null): Promise<void> => {
  // 1. Get User ID (prefer passed argument, fallback to URL)
  const finalUserId = userId || new URLSearchParams(window.location.search).get('userId');

  // 2. Submit to Main App (My Year in the Chair)
  if (finalUserId) {
    if (!MAIN_APP_URL || !GAME_API_SECRET || !GAME_SLUG) {
      console.error('Missing VITE_MAIN_APP_URL, VITE_GAME_API_SECRET, or VITE_GAME_SLUG.');
    } else {
      try {
        const response = await fetch(`${MAIN_APP_URL}/api/mini-games/score`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            secret: GAME_API_SECRET,
            userId: finalUserId,
            gameSlug: GAME_SLUG,
            score: score,
          }),
        });

        if (!response.ok) {
          console.error('Failed to submit score to main app:', await response.text());
        } else {
          console.log('Score submitted to main app successfully');
        }
      } catch (err) {
        console.error('Network error submitting to main app:', err);
      }
    }
  }

  // 3. Keep existing Supabase logic (Optional: serves as a backup)
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('id, score, completed')
      .eq('name', name)
      .order('score', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error checking existing score:', error);
      return;
    }

    const existing = data?.[0];
    if (existing) {
      if (existing.score >= score) {
        return;
      }

      const nextCompleted = existing.completed || completed;
      const { error: updateError } = await supabase
        .from('leaderboard')
        .update({ score, completed: nextCompleted })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Error updating score:', updateError);
      }
      return;
    }

    const { error: insertError } = await supabase
      .from('leaderboard')
      .insert([
        {
          name,
          score,
          completed,
          // created_at is handled by default value in DB
        }
      ]);

    if (insertError) {
      console.error('Error submitting score:', insertError);
    }
  } catch (err) {
    console.error('Unexpected error submitting score:', err);
  }
};
