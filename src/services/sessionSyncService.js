import { supabase } from '../lib/supabaseClient.js';

const isUUID = (str) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

class SessionSyncService {
  constructor() {
    this.debounceTimers = new Map();
    this.realtimeChannel = null;
  }

  /**
   * Fetch all study sessions and their linked artifacts for an authenticated user.
   * Enforces tenant isolation via user_id filtering per .agents/rules/session-management.md
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async loadAllSessions(userId) {
    if (!userId) return [];

    try {
      const { data: sessionRows, error: sessionErr } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (sessionErr) throw sessionErr;

      const { data: artifactRows, error: artErr } = await supabase
        .from('artifacts')
        .select('*')
        .eq('user_id', userId);

      if (artErr) throw artErr;

      const artifactMap = new Map((artifactRows || []).map((art) => [art.id, art]));

      return (sessionRows || []).map((row) => ({
        id: row.id,
        title: row.title || 'Untitled Session',
        subject: row.topic || 'General STEM',
        createdAt: new Date(row.created_at || Date.now()).getTime(),
        updatedAt: new Date(row.updated_at || Date.now()).getTime(),
        messages: row.messages || [],
        artifact: artifactMap.get(row.id)
          ? {
              isOpen: true,
              id: row.id,
              type: artifactMap.get(row.id).type || 'math',
              title: artifactMap.get(row.id).title || 'Untitled Derivation',
              content: artifactMap.get(row.id).content || '',
              language: artifactMap.get(row.id).language || 'latex',
              metadata: artifactMap.get(row.id).metadata || {},
            }
          : {
              isOpen: false,
              id: row.id,
              type: 'math',
              title: 'Blank Derivation Canvas',
              content: '',
              language: 'latex',
              metadata: {},
            },
      }));
    } catch (err) {
      console.warn('[SessionSyncService] Failed to load remote sessions (falling back to local cache):', err?.message || err);
      return [];
    }
  }

  /**
   * Debounced cloud upsert (1000ms delay to prevent network flooding and rate-limits).
   * Cascading identity: uses session.id as artifact.id for 1:1 mapping with zero lookup overhead.
   * @param {object} session
   * @param {string} userId
   * @param {function} onStatusChange
   */
  queueSessionSync(session, userId, onStatusChange) {
    if (!userId || !session?.id) return;

    if (onStatusChange) onStatusChange('syncing');

    if (this.debounceTimers.has(session.id)) {
      clearTimeout(this.debounceTimers.get(session.id));
    }

    const timer = setTimeout(async () => {
      try {
        const safeSessionId = isUUID(session.id) ? session.id : undefined;

        const sessionPayload = {
          ...(safeSessionId ? { id: safeSessionId } : {}),
          user_id: userId,
          title: session.title,
          topic: session.subject || 'General STEM',
          messages: session.messages || [],
          telemetry_trace: session.messages?.slice(-1)[0]?.telemetry || {},
          updated_at: new Date().toISOString(),
        };

        const { data: savedSession, error: sessionError } = await supabase
          .from('study_sessions')
          .upsert(sessionPayload)
          .select()
          .single();

        if (sessionError) throw sessionError;

        const persistentId = savedSession?.id || safeSessionId;

        // Sync corresponding artifact if present and content exists
        if (session.artifact && persistentId) {
          const artifactPayload = {
            id: persistentId, // Shared UUID for 1:1 session-artifact relationship
            user_id: userId,
            type: session.artifact.type || 'math',
            title: session.artifact.title || session.title || 'Untitled Derivation',
            content: session.artifact.content || '',
            language: session.artifact.language || 'latex',
            metadata: session.artifact.metadata || {},
            updated_at: new Date().toISOString(),
          };

          const { error: artError } = await supabase
            .from('artifacts')
            .upsert(artifactPayload);

          if (artError) throw artError;
        }

        if (onStatusChange) onStatusChange('synced');
      } catch (err) {
        console.warn('[SessionSyncService] Sync notice (network/table):', err?.message || err);
        if (onStatusChange) onStatusChange('error');
      } finally {
        this.debounceTimers.delete(session.id);
      }
    }, 1000);

    this.debounceTimers.set(session.id, timer);
  }

  /**
   * Remove session and cascaded artifact from Supabase.
   * @param {string} sessionId
   * @param {string} userId
   */
  async deleteSessionRemote(sessionId, userId) {
    if (!userId || !sessionId) return;
    if (!isUUID(sessionId)) return;

    try {
      await Promise.all([
        supabase.from('study_sessions').delete().match({ id: sessionId, user_id: userId }),
        supabase.from('artifacts').delete().match({ id: sessionId, user_id: userId }),
      ]);
    } catch (err) {
      console.warn('[SessionSyncService] Failed to delete remote session:', err?.message || err);
    }
  }

  /**
   * Subscribe to postgres_changes for live multi-device broadcasts.
   * @param {string} userId
   * @param {function} onRemoteUpdate
   * @returns {function} cleanup unsubscribe
   */
  subscribeToRemoteUpdates(userId, onRemoteUpdate) {
    if (!userId) return () => {};

    if (this.realtimeChannel) {
      this.realtimeChannel.unsubscribe();
    }

    this.realtimeChannel = supabase
      .channel(`public:study_sync:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'study_sessions', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (onRemoteUpdate) onRemoteUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      if (this.realtimeChannel) {
        this.realtimeChannel.unsubscribe();
        this.realtimeChannel = null;
      }
    };
  }
}

export const sessionSyncService = new SessionSyncService();
export default sessionSyncService;
