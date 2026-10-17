import { create } from 'zustand';

export const useAstraStore = create((set) => ({
  // Multimodal HUD State
  hudState: 'idle', // 'idle' | 'listening' | 'thinking' | 'speaking'
  audioLevel: 0,
  activeModality: 'voice', // 'voice' | 'vision' | 'screen'

  setHudState: (hudState) => set({ hudState }),
  setAudioLevel: (audioLevel) => set({ audioLevel }),
  setModality: (activeModality) => set({ activeModality }),

  // Authentication & Access State
  user: null,
  isAuthenticated: false,
  authModalOpen: false,
  authModalTab: 'login', // 'login' | 'register'
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAuthModal: (open, tab = 'login') => set({ authModalOpen: open, authModalTab: tab }),
  logout: () => set({ user: null, isAuthenticated: false }),

  // Socratic Session & Messages State
  messages: [],
  socraticFriction: 'standard', // 'gentle' | 'standard' | 'rigorous'
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
  setSocraticFriction: (socraticFriction) => set({ socraticFriction }),

  // Dual-Pane Artifact Workbench State
  activeArtifact: {
    isOpen: true,
    id: 'art-001',
    type: 'math', // 'math' | 'code' | 'notes'
    title: 'Kinematic Energy Derivation',
    content: '\\Delta K = W_{\\text{net}} = \\int_{x_i}^{x_f} F_{\\text{net}} \\, dx',
    language: 'latex',
    metadata: {
      step: 'Step 1: Integral Formulation',
      status: 'Validated',
      pedagogicalNote: 'Evaluate whether $F_{\\text{net}}$ depends on position $x$ or velocity $v$ before proceeding.'
    }
  },

  openArtifact: (artifact) =>
    set({
      activeArtifact: {
        isOpen: true,
        ...artifact
      }
    }),

  closeArtifact: () =>
    set((state) => ({
      activeArtifact: {
        ...state.activeArtifact,
        isOpen: false
      }
    })),

  updateArtifactContent: (content) =>
    set((state) => ({
      activeArtifact: {
        ...state.activeArtifact,
        content
      }
    })),

  // Agent Telemetry & Reasoning Trace
  telemetryTrace: {
    isReasoning: false,
    startTime: null,
    durationMs: 1400,
    activeTool: null,
    thoughtTrace: '',
    steps: [
      { id: 1, text: 'Parsed Work-Energy theorem request', status: 'success' },
      { id: 2, text: 'Indexed 2 textbook chapters (Halliday & Resnick, Ch. 7)', status: 'success' },
      { id: 3, text: 'Socratic mode: Suppressed turnkey solution; mounted KaTeX derivation canvas', status: 'info' }
    ]
  },

  setTelemetryTrace: (trace) =>
    set((state) => ({
      telemetryTrace: typeof trace === 'function' ? trace(state.telemetryTrace) : { ...state.telemetryTrace, ...trace }
    })),

  startReasoning: (toolName = 'ved_cognitive_engine') =>
    set({
      hudState: 'thinking',
      telemetryTrace: {
        isReasoning: true,
        startTime: Date.now(),
        durationMs: 0,
        activeTool: toolName,
        thoughtTrace: '',
        steps: [
          { id: 'step-1', text: 'Diagnosing governing rules & checking boundary invariants...', status: 'running' }
        ]
      }
    }),

  updateReasoningStep: (id, updates) =>
    set((state) => ({
      telemetryTrace: {
        ...state.telemetryTrace,
        steps: (state.telemetryTrace?.steps || []).map((step) =>
          step.id === id ? { ...step, ...updates } : step
        )
      }
    })),

  addReasoningStep: (step) =>
    set((state) => ({
      telemetryTrace: {
        ...state.telemetryTrace,
        steps: [...(state.telemetryTrace?.steps || []), step]
      }
    })),

  updateThoughtTrace: (thoughtTrace) =>
    set((state) => ({
      telemetryTrace: {
        ...state.telemetryTrace,
        thoughtTrace
      }
    })),

  startTool: (toolName, description) =>
    set((state) => ({
      hudState: 'thinking',
      telemetryTrace: {
        ...state.telemetryTrace,
        isReasoning: true,
        startTime: state.telemetryTrace?.startTime || Date.now(),
        activeTool: toolName,
        steps: description
          ? [...(state.telemetryTrace?.steps || []), { id: Date.now(), text: description, status: 'running' }]
          : state.telemetryTrace?.steps || []
      }
    })),

  completeTool: (status = 'success', payload = {}) =>
    set((state) => ({
      telemetryTrace: {
        ...state.telemetryTrace,
        isReasoning: false,
        activeTool: null,
        ...(payload.trace ? { thoughtTrace: payload.trace } : {})
      }
    }))
}));

export default useAstraStore;
