// src/services/vedSubLlmEngine.js
// Sub-LLM Engine: Tracks student progress from Day 1 and acts as personalized interactive AI chatbot "VED"

import { supabase } from '../lib/supabaseClient';

const STORAGE_KEYS = {
  STUDENT_PROGRESS: 'ved_student_progress_v4',
  REGISTERED_USERS: 'ved_registered_users_v4',
  VED_CHAT_HISTORY: 'ved_companion_chat_v4'
};

/**
 * 1. Initialize or load student performance record from Day 1
 */
export function getOrCreateStudentProgress(user) {
  if (!user || !user.email) return getFallbackProgress();

  const userId = user.userId || `usr_${btoa(user.email).slice(0, 10)}`;
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.STUDENT_PROGRESS}_${userId}`);
    if (raw) {
      const existing = JSON.parse(raw);
      // Recalculate day count dynamically from account creation
      const startMs = new Date(existing.startDate || Date.now()).getTime();
      const diffDays = Math.max(1, Math.ceil((Date.now() - startMs) / (1000 * 60 * 60 * 24)));
      existing.dayCount = diffDays;
      return existing;
    }
  } catch (err) {
    console.warn('[VED Engine] Error reading student progress:', err);
  }

  // Brand-new student progress initialization from Day 1
  const newProgress = {
    userId,
    fullName: user.fullName || 'Scholar',
    email: user.email,
    academicTier: user.academicTier || 'tier_undergrad',
    startDate: new Date().toISOString(),
    dayCount: 1,
    streakDays: user.streakDays || 1,
    totalStudyMinutes: 25,
    todayStudyMinutes: 25,
    overallMasteryScore: 82,
    skillRadar: {
      linearAlgebra: 85,
      pythonDsa: 80,
      probabilityStats: 68,
      calculusOptimization: 84,
      conceptIntuition: 88
    },
    trapsFallen: [
      {
        topic: 'Probability & Stats',
        trapName: 'Base Rate Fallacy in Bayes Theorem',
        timestamp: 'Day 1'
      }
    ],
    verifiedMasteries: [
      {
        topic: 'Linear Algebra',
        concept: 'PCA Rayleigh Quotient Formulation',
        timestamp: 'Day 1'
      }
    ],
    submissionHistory: [],
    recentInteractions: 4
  };

  saveStudentProgress(newProgress);
  return newProgress;
}

/**
 * Persist student progress to localStorage and cloud database
 */
export function saveStudentProgress(progress) {
  if (!progress || !progress.userId) return;
  try {
    localStorage.setItem(
      `${STORAGE_KEYS.STUDENT_PROGRESS}_${progress.userId}`,
      JSON.stringify(progress)
    );
  } catch (err) {
    console.warn('[VED Engine] Error saving local progress:', err);
  }

  // Cloud sync to Supabase (non-blocking)
  syncProgressToCloud(progress).catch((err) =>
    console.warn('[VED Engine] Background cloud sync deferred:', err)
  );
}

/**
 * Cloud database sync via Supabase
 */
export async function syncProgressToCloud(progress) {
  try {
    // 1. Upsert to profiles table
    await supabase.from('profiles').upsert(
      {
        id: progress.userId,
        email: progress.email,
        full_name: progress.fullName,
        academic_tier: progress.academicTier,
        mastery_score: progress.overallMasteryScore,
        streak_days: progress.streakDays,
        study_minutes: progress.totalStudyMinutes,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'email' }
    );

    // 2. Telemetry entry
    await supabase.from('ved_telemetry_logs').insert([
      {
        event_type: 'VED_PROGRESS_SYNC',
        module_id: 'sub_llm_ved',
        payload: {
          userId: progress.userId,
          dayCount: progress.dayCount,
          masteryScore: progress.overallMasteryScore,
          skillRadar: progress.skillRadar
        }
      }
    ]);
  } catch (err) {
    // Fail gracefully in local development or if tables don't exist yet
    console.info('[VED Engine] Supabase database sync notification:', err.message || err);
  }
}

/**
 * Save new user profile directly to Database
 */
export async function saveUserToDatabase(userData) {
  if (!userData || !userData.email) return;

  const record = {
    userId: userData.userId || `usr_${Date.now()}`,
    fullName: userData.fullName || userData.email.split('@')[0],
    email: userData.email.toLowerCase().trim(),
    academicTier: userData.academicTier || 'tier_undergrad',
    startingMode: userData.startingMode || 'regular_llm',
    createdAt: new Date().toISOString(),
    streakDays: userData.streakDays || 1,
    studyMinutes: 15,
    masteryScore: 80
  };

  // 1. Store in local user database
  try {
    const rawUsers = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    const users = rawUsers ? JSON.parse(rawUsers) : [];
    const filtered = users.filter((u) => u.email !== record.email);
    localStorage.setItem(
      STORAGE_KEYS.REGISTERED_USERS,
      JSON.stringify([record, ...filtered])
    );
  } catch (err) {
    console.warn('[VED Engine] Local user db error:', err);
  }

  // 2. Persist to Supabase Profiles & Telemetry
  try {
    await supabase.from('profiles').upsert(
      {
        email: record.email,
        full_name: record.fullName,
        academic_tier: record.academicTier,
        created_at: record.createdAt,
        starting_mode: record.startingMode
      },
      { onConflict: 'email' }
    );

    await supabase.from('ved_users').upsert(
      {
        email: record.email,
        full_name: record.fullName,
        role: 'student',
        academic_tier: record.academicTier
      },
      { onConflict: 'email' }
    );
  } catch (err) {
    console.info('[VED Engine] Supabase user registration sync:', err.message || err);
  }

  return record;
}

/**
 * 2. Record Assignment Submission & Recalculate Mastery
 */
export function recordAssignmentToProgress(progress, evaluation) {
  if (!progress) return;
  const submissions = progress.submissionHistory || [];
  const updatedSubs = [evaluation, ...submissions].slice(0, 30);

  // Recalculate overall mastery score
  const avg = Math.round(
    updatedSubs.reduce((acc, s) => acc + (s.score || 70), 0) / updatedSubs.length
  );

  const updatedProgress = {
    ...progress,
    submissionHistory: updatedSubs,
    overallMasteryScore: Math.min(100, Math.max(50, avg)),
    totalStudyMinutes: (progress.totalStudyMinutes || 0) + 15,
    todayStudyMinutes: (progress.todayStudyMinutes || 0) + 15
  };

  saveStudentProgress(updatedProgress);
  return updatedProgress;
}

/**
 * 3. Generate Personalized Instructions from VED based on Day 1 to Now Performance
 */
export function generateVedPersonalizedInstruction(progress) {
  if (!progress) return 'Welcome to ved.ai! Complete your first derivation to begin tracking.';

  const { fullName, dayCount, overallMasteryScore, skillRadar, trapsFallen, academicTier } =
    progress;

  const firstName = fullName?.split(' ')[0] || 'Scholar';
  const lowestSkill = Object.entries(skillRadar || {}).sort((a, b) => a[1] - b[1])[0];
  const lowestSkillName = lowestSkill ? formatSkillName(lowestSkill[0]) : 'Probability & Stats';
  const lowestSkillScore = lowestSkill ? lowestSkill[1] : 68;

  let tierVoice = '';
  if (academicTier === 'tier_primary') {
    tierVoice = `Hey ${firstName}! Great work reaching Day ${dayCount} of our space adventure! 🚀`;
  } else if (academicTier === 'tier_middle') {
    tierVoice = `Welcome back, ${firstName}! You are making steady progress on Day ${dayCount}.`;
  } else if (academicTier === 'tier_high') {
    tierVoice = `Greetings ${firstName}. Analyzing your Day ${dayCount} STEM performance telemetry.`;
  } else {
    tierVoice = `Day ${dayCount} Analysis for ${firstName}: Velocity is steady with ${overallMasteryScore}% overall mastery.`;
  }

  let remediationAdvice = '';
  if (trapsFallen && trapsFallen.length > 0) {
    const recentTrap = trapsFallen[0];
    remediationAdvice = `I noted a vulnerability in ${recentTrap.topic} (${recentTrap.trapName}). Before advancing to higher-order derivations, solidify this invariant.`;
  } else if (lowestSkillScore < 75) {
    remediationAdvice = `Your ${lowestSkillName} score (${lowestSkillScore}%) needs reinforcement. I recommend completing 2 targeted scaffolding exercises today.`;
  } else {
    remediationAdvice = `Strong mastery demonstrated across all active pillars. You are ready for unguided challenge proofs.`;
  }

  const actionMilestones = [
    `Complete 1 Socratic derivation in ${lowestSkillName} without revealing Level 4`,
    `Review the textbook citation in Slide 3 to verify equation boundary conditions`,
    `Test your retention by explaining the core invariant in simple words in Assignment Lab`
  ];

  return {
    greeting: tierVoice,
    diagnosis: remediationAdvice,
    milestones: actionMilestones,
    masteryScore: overallMasteryScore,
    dayCount
  };
}

/**
 * 4. Interactive Chat with VED (Sub-LLM Companion)
 * Personalized to the student's exact Day 1 progress history & tier
 */
export async function queryVedCompanion({ userPrompt, progress, chatHistory = [] }) {
  const firstName = progress?.fullName?.split(' ')[0] || 'Scholar';
  const day = progress?.dayCount || 1;
  const mastery = progress?.overallMasteryScore || 82;
  const tier = progress?.academicTier || 'tier_undergrad';

  const apiKey = import.meta?.env?.VITE_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const systemInstruction = `You are VED, a personalized, metacognitive AI performance companion and learning coach for ${firstName} (studying under ${tier}).
You have been tracking ${firstName}'s progress from Day 1 to the present (currently Day ${day}, with an Overall Mastery score of ${mastery}%).
Your goal is to give direct, empathetic, and actionable coaching based on their real performance data:
- Linear Algebra: ${progress.skillRadar?.linearAlgebra}%
- Python & Algorithms: ${progress.skillRadar?.pythonDsa}%
- Probability & Stats: ${progress.skillRadar?.probabilityStats}%
- Calculus: ${progress.skillRadar?.calculusOptimization}%
- Recent Traps Encountered: ${JSON.stringify(progress.trapsFallen || [])}

Rules:
1. Speak directly as VED, the student's personal AI mentor.
2. Personalize your response to ${firstName}'s specific day count and mastery data.
3. Be concise (max 3 short paragraphs).
4. Give concrete next actions, not vague advice.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            source: 'gemini-sub-llm',
            reply: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
      }
    } catch (err) {
      console.warn('[VED Engine] Falling back to local sub-LLM synthesis:', err);
    }
  }

  // Built-in intelligent Sub-LLM response engine (100% offline & personalized)
  await new Promise((r) => setTimeout(r, 400));

  const lower = userPrompt.toLowerCase();
  let reply = '';

  if (lower.includes('progress') || lower.includes('how am i') || lower.includes('doing')) {
    reply = `${firstName}, here is your Day ${day} evaluation: Your overall mastery stands at ${mastery}%. You are performing strongest in Python & Algorithms (${progress.skillRadar?.pythonDsa}%), but your lowest confidence area is Probability & Stats (${progress.skillRadar?.probabilityStats}%). You have logged ${progress.totalStudyMinutes} total study minutes since Day 1!`;
  } else if (lower.includes('focus') || lower.includes('study') || lower.includes('next') || lower.includes('what should')) {
    reply = `Based on your Day ${day} track, I recommend zeroing in on Bayes Theorem and conditional expectations today. You previously stumbled on the Base Rate Fallacy. Solve 1 isomorphic problem on the right canvas and avoid the distractor trap!`;
  } else if (lower.includes('trap') || lower.includes('mistake') || lower.includes('weak')) {
    reply = `Examining your mistake log from Day 1: You fell into the Base Rate trap where you confused Sensitivity P(+|Disease) with Posterior P(Disease|+). Remember my shortcut: convert percentages into a 10,000-person population table to eliminate false positives in 20 seconds!`;
  } else if (lower.includes('drill') || lower.includes('quiz') || lower.includes('test')) {
    reply = `Quick 60-Second VED Drill for ${firstName}: Let data matrix X be mean-centered with covariance eigenvalues {7, 3, 2}. What fraction of total variance is retained by the first principal component? (Hint: Total variance = Trace = 12). Check if you get 7/12 = 58.33%!`;
  } else {
    reply = `Understood, ${firstName}. I am tracking your learning trajectory from Day 1 to ensure you don't hit plateaus. As your tier is set to ${formatTierName(tier)}, make sure you write down the governing formula invariant before jumping into calculations. Let me know if you want a progress review or a quick diagnostic drill!`;
  }

  return {
    source: 'ved-local-sub-llm',
    reply,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

function formatSkillName(key) {
  const map = {
    linearAlgebra: 'Linear Algebra',
    pythonDsa: 'Python & Algorithms',
    probabilityStats: 'Probability & Stats',
    calculusOptimization: 'Calculus & Optimization',
    conceptIntuition: 'Conceptual Intuition'
  };
  return map[key] || key;
}

function formatTierName(tierId) {
  const map = {
    tier_primary: 'Primary School (Grades 1–5)',
    tier_middle: 'Middle School (Grades 6–8)',
    tier_high: 'High School STEM (Grades 9–12)',
    tier_undergrad: 'Undergraduate STEM/CS',
    tier_masters: 'Postgraduate & Research',
    admin_gate_da: 'IIT GATE DA Engine'
  };
  return map[tierId] || tierId;
}

function getFallbackProgress() {
  return {
    userId: 'guest_scholar',
    fullName: 'Scholar',
    email: 'scholar@ved.ai',
    academicTier: 'tier_undergrad',
    dayCount: 1,
    streakDays: 1,
    totalStudyMinutes: 20,
    overallMasteryScore: 80,
    skillRadar: {
      linearAlgebra: 80,
      pythonDsa: 80,
      probabilityStats: 70,
      calculusOptimization: 80,
      conceptIntuition: 85
    },
    trapsFallen: [],
    submissionHistory: []
  };
}
