import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PanelLeftClose,
  PanelLeft,
  Plus,
  MessageSquare,
  MoreVertical,
  Edit3,
  Trash2,
  Check,
  X,
  Sparkles,
  BookOpen,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';

/**
 * SessionSidebar
 * Gemini-style collapsible drawer for isolated student chat sessions.
 * Adheres strictly to .agents/rules/session-management.md & .agents/rules/ved-ui-system.md
 */
export default function SessionSidebar() {
  const {
    sessions,
    activeSessionId,
    isSidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    createNewSession,
    switchSession,
    renameSession,
    deleteSession
  } = useSessionStore();

  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [activeMenuSessionId, setActiveMenuSessionId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const editInputRef = useRef(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editingSessionId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingSessionId]);

  // Close context dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('[data-session-menu]')) {
        setActiveMenuSessionId(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Chronological Grouping per session-management.md:
  // - "Today" (< 24 hours ago)
  // - "Previous 7 Days" (< 7 days ago)
  // - "Older" (> 7 days ago)
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const SEVEN_DAYS = 7 * ONE_DAY;

  const sessionList = Object.values(sessions || {}).sort(
    (a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
  );

  const groups = {
    today: sessionList.filter((s) => now - (s.updatedAt || s.createdAt || now) < ONE_DAY),
    previous7Days: sessionList.filter((s) => {
      const diff = now - (s.updatedAt || s.createdAt || now);
      return diff >= ONE_DAY && diff < SEVEN_DAYS;
    }),
    older: sessionList.filter((s) => now - (s.updatedAt || s.createdAt || now) >= SEVEN_DAYS)
  };

  const handleStartRename = (session, e) => {
    if (e) e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
    setActiveMenuSessionId(null);
  };

  const handleSaveRename = (sessionId) => {
    if (editingTitle.trim()) {
      renameSession(sessionId, editingTitle.trim());
    }
    setEditingSessionId(null);
  };

  const handleKeyDown = (e, sessionId) => {
    if (e.key === 'Enter') {
      handleSaveRename(sessionId);
    } else if (e.key === 'Escape') {
      setEditingSessionId(null);
    }
  };

  const handleDelete = (sessionId, e) => {
    if (e) e.stopPropagation();
    deleteSession(sessionId);
    setConfirmDeleteId(null);
    setActiveMenuSessionId(null);
  };

  const handleCreateNew = () => {
    createNewSession('New Study Session');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay (<768px) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Slide-over Drawer Panel */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.aside
            key="session-sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-white/[0.08] bg-zinc-950/95 backdrop-blur-2xl shadow-2xl md:relative md:z-20 overflow-hidden shrink-0"
            style={{ width: 280 }}
          >
            {/* Header: Brand & Collapse Toggle */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] px-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-sm shadow-indigo-500/20">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold tracking-tight text-white">ved.ai sessions</span>
              </div>

              <button
                onClick={toggleSidebar}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200 transition-colors cursor-pointer"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>

            {/* "+ New Study Session" Dashed Action Button */}
            <div className="p-3 shrink-0">
              <button
                onClick={handleCreateNew}
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-500/35 bg-indigo-500/[0.04] px-3.5 py-2.5 text-xs font-medium text-indigo-300 hover:border-indigo-500/60 hover:bg-indigo-500/10 hover:text-indigo-200 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-200" />
                <span>+ New Study Session</span>
              </button>
            </div>

            {/* Scrollable Sessions List */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4 select-none">
              
              {/* Group: Today */}
              {groups.today.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 pt-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    Today
                  </div>
                  {groups.today.map((s) => renderSessionItem(s))}
                </div>
              )}

              {/* Group: Previous 7 Days */}
              {groups.previous7Days.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 pt-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    Previous 7 Days
                  </div>
                  {groups.previous7Days.map((s) => renderSessionItem(s))}
                </div>
              )}

              {/* Group: Older */}
              {groups.older.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 pt-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    Older
                  </div>
                  {groups.older.map((s) => renderSessionItem(s))}
                </div>
              )}

              {/* Empty Sessions State */}
              {sessionList.length === 0 && (
                <div className="p-6 text-center text-xs text-zinc-500 space-y-2">
                  <BookOpen className="mx-auto h-5 w-5 text-zinc-600" />
                  <p>No active sessions yet.</p>
                </div>
              )}
            </div>

            {/* Bottom Panel Status */}
            <div className="shrink-0 border-t border-white/[0.06] p-3 text-[11px] font-mono text-zinc-500 flex items-center justify-between">
              <span>{sessionList.length} Sessions Saved</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" title="Local Persistence Active" />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Floating Toggle Icon when sidebar is collapsed */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-3.5 left-3.5 z-40 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.1] bg-zinc-900/80 text-zinc-400 backdrop-blur-xl shadow-lg hover:border-indigo-500/40 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
          title="Open sessions sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl border border-white/[0.1] bg-zinc-900 p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">Delete Session?</h3>
                  <p className="text-xs text-zinc-400">This action cannot be undone.</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="rounded-xl px-3.5 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDeleteId)}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-medium text-white hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/20 cursor-pointer"
                >
                  Delete Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );

  // Helper renderer for each session row item
  function renderSessionItem(session) {
    const isActive = session.id === activeSessionId;
    const isEditing = session.id === editingSessionId;
    const isMenuOpen = session.id === activeMenuSessionId;

    return (
      <div
        key={session.id}
        onClick={() => !isEditing && switchSession(session.id)}
        onDoubleClick={(e) => handleStartRename(session, e)}
        className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-all cursor-pointer ${
          isActive
            ? 'border border-indigo-500/30 bg-indigo-500/15 text-indigo-100 shadow-sm'
            : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate min-w-0 flex-1 mr-2">
          <MessageSquare className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />

          {isEditing ? (
            <input
              ref={editInputRef}
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={() => handleSaveRename(session.id)}
              onKeyDown={(e) => handleKeyDown(e, session.id)}
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded bg-zinc-900 px-1.5 py-0.5 text-xs text-white outline-none ring-1 ring-indigo-500"
            />
          ) : (
            <span className="truncate font-medium">{session.title}</span>
          )}
        </div>

        {/* Action dropdown or inline controls */}
        {!isEditing && (
          <div className="relative shrink-0" data-session-menu>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuSessionId(isMenuOpen ? null : session.id);
              }}
              className={`rounded p-1 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer ${
                isActive || isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>

            {/* Context Action Dropdown Menu */}
            {isMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1 z-30 w-32 rounded-xl border border-white/[0.08] bg-zinc-900/95 p-1 backdrop-blur-2xl shadow-xl space-y-0.5"
              >
                <button
                  onClick={(e) => handleStartRename(session, e)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
                >
                  <Edit3 className="h-3 w-3 text-indigo-400" />
                  <span>Rename</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteId(session.id);
                    setActiveMenuSessionId(null);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3 w-3 text-rose-400" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
