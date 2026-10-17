/**
 * useVedStore.js
 * Centralized Zustand store for the Ved-Core Multi-Tier LLM Engine and Admin GATE DA Command Center.
 * 
 * Manages:
 * - Active Academic Tier ('tier_primary' | 'tier_middle' | 'tier_high' | 'tier_undergrad' | 'tier_masters' | 'admin_gate_da')
 * - Admin Mode authentication & toggle
 * - Official 7 GATE DA Pillars filtering & question format selection
 * - Live scoring telemetry with -1/3 and -2/3 MCQ penalty rules
 * - Multi-mode Artifact Workbench state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ACADEMIC_TIERS, TIER_DEMO_PRESETS } from '../llm/tierPresets.js';
import { GATE_DA_CURATED_PROBLEMS, computeNetScore } from '../llm/gateDaEngine.js';

export const useVedStore = create(
  persist(
    (set, get) => ({
      // Active Tier & Admin Mode State
      activeTier: 'tier_high',
      isAdminMode: false,
      isAdminAuthenticated: true, // Developer/Admin default access

      // GATE DA Mode Filters & Selection
      activeGatePillar: 'ALL', // 'ALL' | 'PROB_STAT' | 'LIN_ALG' | 'CALC_OPT' | 'PYTHON_DSA' | 'DBMS_DW' | 'ML' | 'AI' | 'GA'
      activeQuestionFormat: 'ALL', // 'ALL' | 'MCQ' | 'MSQ' | 'NAT'
      activeGateProblemId: 'gate-da-001',

      // GATE DA Exam Telemetry & Score Tracking
      gateAnswers: [],
      gateStats: {
        attempted: 0,
        correct: 0,
        incorrect: 0,
        netScore: 0,
        accuracy: 0,
        pillarStats: {}
      },

      // Global Multimodal HUD State
      hudState: 'idle', // 'idle' | 'listening' | 'thinking' | 'speaking'

      // Active Workbench Artifact
      activeArtifact: {
        isOpen: true,
        type: 'math',
        title: 'Work-Kinetic Energy Derivation',
        stepBadge: 'Step 1: Formulation',
        validationStatus: 'Validated',
        content: 'W_{\\text{net}} = \\Delta K = \\int_{x_i}^{x_f} F(x) \\, dx = \\frac{1}{2} m v_f^2 - \\frac{1}{2} m v_i^2',
        language: 'latex',
        metadata: {
          step: 'Step 1: Formulation',
          status: 'Validated',
          pedagogicalNote: 'Carries physical units of Joules (J). Verified for single-variable position displacement.'
        }
      },

      // Actions
      setTier: (tierId) => {
        const isAdmin = tierId === 'admin_gate_da';
        const preset = TIER_DEMO_PRESETS[tierId];

        set({
          activeTier: tierId,
          isAdminMode: isAdmin,
          ...(preset?.artifact ? { activeArtifact: preset.artifact } : {})
        });
      },

      toggleAdminMode: (forceState = null) => {
        const currentMode = get().isAdminMode;
        const nextMode = forceState !== null ? forceState : !currentMode;

        if (nextMode) {
          const preset = TIER_DEMO_PRESETS['admin_gate_da'];
          set({
            isAdminMode: true,
            activeTier: 'admin_gate_da',
            activeArtifact: preset.artifact,
            activeGateProblemId: 'gate-da-001'
          });
        } else {
          const preset = TIER_DEMO_PRESETS['tier_high'];
          set({
            isAdminMode: false,
            activeTier: 'tier_high',
            activeArtifact: preset.artifact
          });
        }
      },

      setGatePillar: (pillar) => set({ activeGatePillar: pillar }),
      setQuestionFormat: (format) => set({ activeQuestionFormat: format }),

      selectGateProblem: (problemId) => {
        const problem = GATE_DA_CURATED_PROBLEMS.find((p) => p.id === problemId);
        if (!problem) return;

        set({
          activeGateProblemId: problemId,
          activeArtifact: {
            isOpen: true,
            type: 'gate_simulator',
            title: `IIT GATE DA: ${problem.title}`,
            stepBadge: `Pillar: ${problem.pillar} (${problem.marks} Mark${problem.marks > 1 ? 's' : ''})`,
            validationStatus: 'Trap Alert',
            content: problem.questionText,
            metadata: {
              step: 'GATE DA Problem Simulator',
              status: 'Active Question',
              problemId: problem.id,
              pillar: problem.pillar,
              marks: problem.marks,
              type: problem.type,
              negativeMarks: problem.negativeMarks,
              options: problem.options,
              correctAnswer: problem.correctAnswer,
              shortcut: problem.shortcut,
              distractorTraps: problem.distractorTraps,
              fullDerivation: problem.fullDerivation,
              acceptableRange: problem.acceptableRange
            }
          }
        });
      },

      recordGateAnswer: ({ questionId, userResponse }) => {
        const existingAnswers = get().gateAnswers.filter((a) => a.questionId !== questionId);
        const newAnswers = [...existingAnswers, { questionId, userResponse, timestamp: Date.now() }];
        const newStats = computeNetScore(newAnswers, GATE_DA_CURATED_PROBLEMS);

        set({
          gateAnswers: newAnswers,
          gateStats: newStats
        });

        return newStats;
      },

      resetGateStats: () => {
        set({
          gateAnswers: [],
          gateStats: {
            attempted: 0,
            correct: 0,
            incorrect: 0,
            netScore: 0,
            accuracy: 0,
            pillarStats: {}
          }
        });
      },

      setHudState: (hudState) => set({ hudState }),

      setActiveArtifact: (artifact) =>
        set((state) => ({
          activeArtifact: {
            isOpen: true,
            ...state.activeArtifact,
            ...artifact
          }
        })),

      updateActiveArtifact: (patch) =>
        set((state) => ({
          activeArtifact: {
            ...state.activeArtifact,
            ...patch
          }
        })),

      closeArtifact: () =>
        set((state) => ({
          activeArtifact: {
            ...state.activeArtifact,
            isOpen: false
          }
        })),

      loadTierPreset: (tierId) => {
        const preset = TIER_DEMO_PRESETS[tierId];
        if (!preset) return null;

        const isAdmin = tierId === 'admin_gate_da';
        set({
          activeTier: tierId,
          isAdminMode: isAdmin,
          activeArtifact: preset.artifact
        });

        return preset;
      }
    }),
    {
      name: 'ved-ai-global-store',
      partialize: (state) => ({
        activeTier: state.activeTier,
        isAdminMode: state.isAdminMode,
        activeGatePillar: state.activeGatePillar,
        activeQuestionFormat: state.activeQuestionFormat,
        gateAnswers: state.gateAnswers,
        gateStats: state.gateStats
      })
    }
  )
);

export default useVedStore;
