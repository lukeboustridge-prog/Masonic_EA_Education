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
  console.log(`[SubmitScore] Attempting to submit: Name=${name}, Score=${score}, Completed=${completed}, UserID=${userId}`);

  // 1. Get User ID (Check args, then URL, then potentially LocalStorage if you use it)
  const finalUserId = userId || new URLSearchParams(window.location.search).get('userId');

  // 2. Submit to Main App (My Year in the Chair)
  if (finalUserId) {
    if (!MAIN_APP_URL || !GAME_API_SECRET || !GAME_SLUG) {
      console.error('[SubmitScore] Missing Env Vars. Skipping Main App submission.');
    } else {
      const normalizedMainAppUrl = MAIN_APP_URL.replace(/\/+$/, '');
      try {
        console.log('[SubmitScore] Sending to Main App...');
        const response = await fetch(`${normalizedMainAppUrl}/api/mini-games/score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: GAME_API_SECRET,
            userId: finalUserId,
            gameSlug: GAME_SLUG,
            score: score,
          }),
        });

        if (!response.ok) {
          console.error('[SubmitScore] Main App Rejected:', await response.text());
        } else {
          console.log('[SubmitScore] Main App Success');
        }
      } catch (err) {
        console.error('[SubmitScore] Main App Network Error:', err);
      }
    }
  } else {
    console.warn('[SubmitScore] SKIPPING Main App: No userId found. Ensure ?userId=... is in the URL.');
  }

  // 3. Supabase Logic
  try {
    // Fetch the HIGHEST score for this specific name
    const { data, error } = await supabase
      .from('leaderboard')
      .select('id, score, completed')
      .eq('name', name)
      .order('score', { ascending: false })
      .limit(1);

    if (error) {
      console.error('[SubmitScore] Supabase Fetch Error:', error);
      return;
    }

    const existing = data?.[0];
    
    if (existing) {
      const existingScore = Number(existing.score);
      
      console.log(`[SubmitScore] Found existing entry for ${name} (ID: ${existing.id}): ${existingScore}`);

      if (Number.isFinite(existingScore) && existingScore >= score) {
        console.log('[SubmitScore] Existing score is higher or equal. No DB update required.');
        return;
      }

      console.log('[SubmitScore] New High Score! Updating DB...');
      
      const nextCompleted = existing.completed || completed;
      
      // FIX: Update by ID and use .select() to verify the row was actually touched
      const { data: updatedRows, error: updateError } = await supabase
        .from('leaderboard')
        .update({ score, completed: nextCompleted })
        .eq('id', existing.id)
        .select();

      if (updateError) {
        console.error('[SubmitScore] Update FAILED with error:', updateError);
      } else if (!updatedRows || updatedRows.length === 0) {
        console.error('[SubmitScore] Update FAILED: Success reported, but 0 rows were changed. This is usually an RLS Policy issue.');
      } else {
        console.log('[SubmitScore] DB Updated Successfully:', updatedRows);
      }

    } else {
      console.log('[SubmitScore] No existing entry. Inserting new record.');
      
      const { error: insertError } = await supabase
        .from('leaderboard')
        .insert([{ name, score, completed }]);

      if (insertError) console.error('[SubmitScore] Insert Error:', insertError);
    }
  } catch (err) {
    console.error('[SubmitScore] Unexpected Supabase Error:', err);
  }
};
