import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sessionSyncService } from '../services/sessionSyncService.js';

const INITIAL_WELCOME_SESSION_ID = 'e1d5a7b2-3c4f-4a6e-8b9d-0c1f2e3a4b5c';

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'e1d5a7b2-' + Date.now().toString(16).slice(-4) + '-4a6e-8b9d-' + Math.random().toString(16).slice(2, 14);
};

export const useSessionStore = create(
  persist(
    (set, get) => ({
      // Active Session Pointer & Sidebar State
      activeSessionId: INITIAL_WELCOME_SESSION_ID,
      isSidebarOpen: true,

      // Multi-device Sync State per .agents/rules/session-management.md
      syncStatus: 'synced', // 'synced' | 'syncing' | 'error' | 'offline'
      userId: null,

      // Sessions Dictionary indexed by UUID
      sessions: {
        [INITIAL_WELCOME_SESSION_ID]: {
          id: INITIAL_WELCOME_SESSION_ID,
          title: 'Kinematic Energy Derivation',
          subject: 'Physics',
          createdAt: Date.now() - 3600000,
          updatedAt: Date.now(),
          messages: [
            {
              id: 'm1',
              role: 'assistant',
              content: 'Net work done on a particle equals the change in its kinetic energy. What is your expression for the force function $F(x)$?',
              textParagraphs: [
                'Net work done on a particle equals the change in its kinetic energy.',
                'Remember that net work corresponds directly to the total change in kinetic energy: $W_{\\text{net}} = \\Delta K$.'
              ],
              inlineFormula: 'W_{\\text{net}} = \\Delta K = K_f - K_i',
              timestamp: '10:42 AM',
              telemetry: {
                durationMs: 1200,
                toolsUsed: ['Indexed Resnick & Halliday, Ch. 7'],
              },
              elicitationChips: [
                { id: 'hint-1', label: 'Give me a hint', query: 'Can you provide a gentle hint for the next step?' },
                { id: 'intuition-1', label: 'Show graphical intuition', query: 'Explain the geometric intuition behind this integral.' },
                { id: 'pitfalls-1', label: 'Common exam pitfalls', query: 'What mistakes do students usually make here?' },
                { id: 'quiz-1', label: 'Test my understanding', query: 'Quiz me on this concept with different numbers.' }
              ]
            },
          ],
          artifact: {
            isOpen: true,
            id: INITIAL_WELCOME_SESSION_ID,
            type: 'math',
            title: 'Kinematic Energy Derivation',
            content: '\\Delta K = W_{\\text{net}} = \\int_{x_i}^{x_f} F_{\\text{net}} \\, dx',
            language: 'latex',
            metadata: {
              step: 'Step 1: Integral Formulation',
              status: 'Validated',
              pedagogicalNote: 'Evaluate whether F_{net} depends on position x or velocity v before proceeding.',
            },
          },
        },
      },

      setSyncStatus: (syncStatus) => set({ syncStatus }),

      // Initialize user and hydrate state from Supabase
      initSessionSync: async (userId) => {
        if (!userId) return;
        set({ userId, syncStatus: 'syncing' });

        try {
          const remoteSessions = await sessionSyncService.loadAllSessions(userId);

          if (remoteSessions.length > 0) {
            const sessionsMap = {};
            remoteSessions.forEach((s) => {
              sessionsMap[s.id] = s;
            });

            set((state) => ({
              sessions: { ...state.sessions, ...sessionsMap },
              activeSessionId: state.activeSessionId || remoteSessions[0].id,
              syncStatus: 'synced',
            }));
          } else {
            // First time user onboarding session if empty
            if (Object.keys(get().sessions || {}).length === 0) {
              get().createNewSession('Kinematic Energy Derivation', 'Physics');
            }
            set({ syncStatus: 'synced' });
          }

          // Subscribe to live multi-device broadcasts
          sessionSyncService.subscribeToRemoteUpdates(userId, (payload) => {
            if (payload.eventType === 'DELETE' && payload.old?.id) {
              get().deleteSession(payload.old.id, false);
            }
          });
        } catch {
          set({ syncStatus: 'offline' });
        }
      },

      // Sidebar Actions
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

      // Session Lifecycle Management
      createNewSession: (title = 'New Study Session', subject = 'General STEM', initialArtifact = null) => {
        const newId = generateUUID();
        const newSession = {
          id: newId,
          title,
          subject,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [],
          artifact: initialArtifact || {
            isOpen: false,
            id: newId,
            type: 'math',
            title: 'Blank Derivation Canvas',
            content: '',
            language: 'latex',
            metadata: {},
          },
        };

        set((state) => ({
          sessions: {
            [newId]: newSession,
            ...state.sessions,
          },
          activeSessionId: newId,
        }));

        const { userId } = get();
        if (userId) {
          sessionSyncService.queueSessionSync(newSession, userId, (status) =>
            set({ syncStatus: status })
          );
        }

        return newId;
      },

      switchSession: (sessionId) => {
        if (get().sessions[sessionId]) {
          set({ activeSessionId: sessionId });
        }
      },

      renameSession: (sessionId, newTitle) => {
        if (!newTitle || !newTitle.trim()) return;
        set((state) => {
          if (!state.sessions[sessionId]) return state;
          const updated = {
            ...state.sessions[sessionId],
            title: newTitle.trim(),
            updatedAt: Date.now(),
          };

          const { userId } = state;
          if (userId) {
            sessionSyncService.queueSessionSync(updated, userId, (status) =>
              set({ syncStatus: status })
            );
          }

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: updated,
            },
          };
        });
      },

      deleteSession: (sessionId, syncToRemote = true) => {
        const { userId } = get();
        if (syncToRemote && userId) {
          sessionSyncService.deleteSessionRemote(sessionId, userId);
        }

        set((state) => {
          const updatedSessions = { ...state.sessions };
          delete updatedSessions[sessionId];

          const remainingIds = Object.keys(updatedSessions);
          let nextActiveId =
            state.activeSessionId === sessionId
              ? remainingIds.length > 0
                ? remainingIds[0]
                : null
              : state.activeSessionId;

          // If all sessions deleted, spawn a clean new one
          if (!nextActiveId) {
            const fallbackId = generateUUID();
            return {
              sessions: {
                [fallbackId]: {
                  id: fallbackId,
                  title: 'New Study Session',
                  subject: 'General STEM',
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                  messages: [],
                  artifact: {
                    isOpen: false,
                    id: fallbackId,
                    type: 'math',
                    title: 'Blank Derivation Canvas',
                    content: '',
                    language: 'latex',
                    metadata: {},
                  },
                },
              },
              activeSessionId: fallbackId,
            };
          }

          return {
            sessions: updatedSessions,
            activeSessionId: nextActiveId,
          };
        });
      },

      // Message Dispatch within Current Session
      addMessageToActiveSession: (role, content, telemetry = null, extraProps = {}) => {
        const { activeSessionId, sessions, userId } = get();
        if (!activeSessionId || !sessions[activeSessionId]) return;

        const currentSession = sessions[activeSessionId];
        const isContentObject = typeof content === 'object' && content !== null;
        const textContent = isContentObject
          ? (content.textParagraphs?.join('\n') || content.content || '')
          : String(content);

        const newMessage = {
          id: generateUUID(),
          role,
          content: textContent,
          textParagraphs: isContentObject
            ? (content.textParagraphs || [textContent])
            : [textContent],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          telemetry: telemetry || (isContentObject ? content.telemetry : null),
          ...(isContentObject ? content : {}),
          ...extraProps,
        };

        // Auto-title session based on first user message if untitled or generic
        let title = currentSession.title;
        if (
          (currentSession.messages.length === 0 || currentSession.title === 'New Study Session') &&
          role === 'user'
        ) {
          title = textContent.slice(0, 32) + (textContent.length > 32 ? '...' : '');
        }

        const updatedSession = {
          ...currentSession,
          title,
          updatedAt: Date.now(),
          messages: [...currentSession.messages, newMessage],
        };

        set((state) => ({
          sessions: {
            ...state.sessions,
            [activeSessionId]: updatedSession,
          },
        }));

        if (userId) {
          sessionSyncService.queueSessionSync(updatedSession, userId, (status) =>
            set({ syncStatus: status })
          );
        }

        return newMessage;
      },

      // Update Current Session's Artifact Canvas
      updateActiveArtifact: (patch) => {
        const { activeSessionId, sessions, userId } = get();
        if (!activeSessionId || !sessions[activeSessionId]) return;

        const currentArtifact = sessions[activeSessionId].artifact || {};

        const updatedSession = {
          ...sessions[activeSessionId],
          updatedAt: Date.now(),
          artifact: {
            ...currentArtifact,
            ...patch,
          },
        };

        set((state) => ({
          sessions: {
            ...state.sessions,
            [activeSessionId]: updatedSession,
          },
        }));

        if (userId) {
          sessionSyncService.queueSessionSync(updatedSession, userId, (status) =>
            set({ syncStatus: status })
          );
        }
      },
    }),
    {
      name: 'ved-ai-student-sessions',
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
      }),
    }
  )
);
