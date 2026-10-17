import { supabase } from '../lib/supabaseClient.js';

let saveTimeout = null;

/**
 * Inserts or updates an artifact row in public.artifacts.
 * Enforces tenant isolation by attaching the current user's ID per .agents/rules/supabase-backend.md
 * @param {object} artifact 
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function saveArtifact(artifact) {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      throw new Error('User must be authenticated to save artifacts.');
    }

    const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
    const validId = artifact.id && isUUID(artifact.id) ? artifact.id : undefined;

    const payload = {
      ...(validId ? { id: validId } : {}),
      user_id: userId,
      type: artifact.type || 'math',
      title: artifact.title || 'Untitled Derivation',
      content: artifact.content || '',
      language: artifact.language || 'latex',
      metadata: artifact.metadata || {},
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('artifacts')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('saveArtifact error:', error.message);
    return { data: null, error };
  }
}

/**
 * Debounced artifact save (1000ms) to avoid overwhelming database write limits
 * per .agents/rules/supabase-backend.md
 * @param {object} artifact 
 * @param {number} delayMs 
 * @returns {Promise<void>}
 */
export function debouncedSaveArtifact(artifact, delayMs = 1000) {
  return new Promise((resolve, reject) => {
    if (saveTimeout) clearTimeout(saveTimeout);

    saveTimeout = setTimeout(async () => {
      const result = await saveArtifact(artifact);
      if (result.error) reject(result.error);
      else resolve(result.data);
    }, delayMs);
  });
}

/**
 * Fetches the student's saved derivations and code snippets.
 * RLS automatically isolates queries to session.user.id.
 * @returns {Promise<{data: Array, error: object|null}>}
 */
export async function loadArtifacts() {
  try {
    const { data, error } = await supabase
      .from('artifacts')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('loadArtifacts error:', error.message);
    return { data: [], error };
  }
}

/**
 * Subscribes to real-time changes in public.artifacts for instant synchronized workbench updates.
 * @param {function} onPayload 
 * @returns {function} unsubscribe cleanup
 */
export function subscribeToArtifacts(onPayload) {
  const channel = supabase
    .channel('public:artifacts')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'artifacts' },
      (payload) => {
        if (typeof onPayload === 'function') {
          onPayload(payload);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
