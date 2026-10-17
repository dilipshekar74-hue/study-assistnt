// src/services/vedBackend.js

const STORAGE_KEYS = {
    SESSION: 'ved_auth_session_v1',
    TELEMETRY: 'ved_backend_telemetry_v1',
    ASSIGNMENTS: 'ved_backend_assignments_v1',
    PROGRESS: 'ved_backend_progress_v1'
};

// Optional Supabase REST configuration via environment variables
const SUPABASE_URL = import.meta?.env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta?.env?.VITE_SUPABASE_ANON_KEY || '';

async function syncToCloudTable(tableName, record) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { synced: false, mode: 'local_mirror' };
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                Prefer: 'return=minimal'
            },
            body: JSON.stringify(record)
        });
        return { synced: res.ok, status: res.status };
    } catch (err) {
        console.warn(`[vedBackend] Cloud sync deferred for ${tableName}:`, err);
        return { synced: false, mode: 'local_fallback' };
    }
}

export const vedBackend = {
    // 1. Get Current Mandatory Auth Session
    getSession() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    },

    // 2. Mandatory Login / Registration Handler
    async loginUser({ fullName, email, password, role, academicTier }) {
        if (!email || !password || !fullName) {
            throw new Error('Full Name, Email, and Password are required to access ved.ai.');
        }

        const userSession = {
            userId: `usr_${btoa(email).slice(0, 10)}_${Date.now().toString().slice(-4)}`,
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            role: role || 'student', // 'student' | 'admin_gate_da'
            academicTier: role === 'admin_gate_da' ? 'admin_gate_da' : academicTier,
            loginTimestamp: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(userSession));

        await syncToCloudTable('ved_users', {
            email: userSession.email,
            full_name: userSession.fullName,
            role: userSession.role,
            academic_tier: userSession.academicTier
        });

        await this.logTelemetryEvent({
            eventType: 'AUTH_LOGIN',
            moduleId: 'system_auth',
            payload: {
                email: userSession.email,
                role: userSession.role,
                academicTier: userSession.academicTier
            }
        });

        return userSession;
    },

    // 3. Logout
    async logoutUser() {
        await this.logTelemetryEvent({
            eventType: 'AUTH_LOGOUT',
            moduleId: 'system_auth',
            payload: { timestamp: new Date().toISOString() }
        });
        localStorage.removeItem(STORAGE_KEYS.SESSION);
    },

    // 4. Universal Telemetry Collector (Logs every option click, textbook view, prompt, and quiz)
    async logTelemetryEvent({ eventType, moduleId, payload = {} }) {
        const session = this.getSession();
        const entry = {
            id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            userId: session?.userId || 'unauthenticated',
            userEmail: session?.email || 'anonymous',
            academicTier: session?.academicTier || 'unknown',
            eventType,
            moduleId,
            payload,
            timestamp: new Date().toISOString()
        };

        const existing = this.getTelemetryLogs();
        const updated = [entry, ...existing].slice(0, 150);
        localStorage.setItem(STORAGE_KEYS.TELEMETRY, JSON.stringify(updated));

        await syncToCloudTable('ved_telemetry_logs', {
            event_type: eventType,
            module_id: moduleId,
            payload: { ...payload, userEmail: entry.userEmail }
        });

        return entry;
    },

    getTelemetryLogs() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.TELEMETRY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    },

    // 5. Assignment Submission & Grading Persistence
    async submitAssignment({ moduleId, assignmentTitle, submissionText, evaluation }) {
        const session = this.getSession();
        const record = {
            id: `asg_${Date.now()}`,
            userId: session?.userId || 'guest',
            userEmail: session?.email || 'guest',
            moduleId,
            assignmentTitle,
            submissionText,
            score: evaluation.score,
            status: evaluation.status,
            feedback: evaluation.feedback,
            submittedAt: new Date().toISOString()
        };

        const existing = this.getAssignments();
        const updated = [record, ...existing];
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(updated));

        await syncToCloudTable('ved_assignment_submissions', {
            module_id: moduleId,
            assignment_title: assignmentTitle,
            student_submission: submissionText,
            score: evaluation.score,
            status: evaluation.status,
            ai_feedback: evaluation.feedback
        });

        await this.logTelemetryEvent({
            eventType: 'ASSIGNMENT_SUBMITTED',
            moduleId,
            payload: {
                assignmentTitle,
                score: evaluation.score,
                status: evaluation.status
            }
        });

        return record;
    },

    getAssignments() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }
};