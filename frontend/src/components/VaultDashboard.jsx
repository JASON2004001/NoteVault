import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import {
  fetchFolders,
  createFolder,
  deleteFolder,
  fetchNotes,
  deleteNote,
  setActiveFolder,
  resetVaultState,
} from '../store/vaultSlice';
import NoteEditorModal from './NoteEditorModal';

export default function VaultDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { folders, notes, activeFolderId, loading } = useSelector((state) => state.vault);

  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    dispatch(fetchFolders());
    dispatch(fetchNotes());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(resetVaultState());
    dispatch(logout());
  };

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    dispatch(createFolder(newFolderName.trim()));
    setNewFolderName('');
    setShowFolderInput(false);
  };

  const handleDeleteFolder = (e, folderId) => {
    e.stopPropagation();
    if (window.confirm('Delete this folder and all notepads inside it?')) {
      dispatch(deleteFolder(folderId));
    }
  };

  const openNewNoteModal = () => {
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const openEditNoteModal = (note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const getPlainTextPreview = (html) => {
    if (!html) return '';
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  // Filter notes by active folder & search query
  const visibleNotes = notes.filter((note) => {
    const matchesFolder =
      activeFolderId === 'all'
        ? true
        : activeFolderId === 'root'
        ? !note.folderId
        : note.folderId === activeFolderId;

    const q = searchQuery.toLowerCase();
    const plainText = getPlainTextPreview(note.topContent).toLowerCase();
    const matchesSearch =
      note.title.toLowerCase().includes(q) ||
      plainText.includes(q) ||
      (note.bottomContent && note.bottomContent.toLowerCase().includes(q));

    return matchesFolder && matchesSearch;
  });

  const getFolderName = (fId) => {
    if (!fId) return null;
    const found = folders.find((f) => f._id === fId);
    return found ? found.name : null;
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-[#f1f5f9] pb-24">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Top Personalized Header */}
        <header className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5 sm:p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-[#38bdf8]">
              Hi {user?.name},
            </h1>
            <p className="text-xs sm:text-sm text-[#94a3b8] mt-1">
              Your notepads are here — {notes.length} unlimited {notes.length === 1 ? 'note' : 'notes'} stored
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFolderInput((prev) => !prev)}
              className="px-3.5 py-2 rounded-xl bg-[#1f2937] hover:bg-[#38bdf8]/20 text-[#38bdf8] text-xs font-semibold transition cursor-pointer"
            >
              + New Folder
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-[#1f2937] hover:bg-red-500/20 hover:text-red-400 text-xs font-semibold transition cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </header>

        {/* Inline New Folder Creator */}
        {showFolderInput && (
          <form
            onSubmit={handleCreateFolder}
            className="mb-5 p-4 bg-[#111827] border border-[#38bdf8]/40 rounded-2xl flex gap-2"
          >
            <input
              type="text"
              placeholder="Enter folder name (e.g., College, Personal, Work)..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-[#1f2937] text-sm text-white focus:outline-none focus:border-[#38bdf8]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#38bdf8] text-black font-bold text-xs uppercase cursor-pointer"
            >
              Create
            </button>
          </form>
        )}

        {/* Search & Folder Navigation Bar */}
        <div className="space-y-3 mb-6">
          <input
            type="text"
            placeholder="Search your notepads by name or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-[#1f2937] text-sm text-white focus:outline-none focus:border-[#38bdf8]"
          />

          {/* Horizontal Scrollable Folders Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => dispatch(setActiveFolder('all'))}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeFolderId === 'all'
                  ? 'bg-[#38bdf8] text-black font-bold'
                  : 'bg-[#111827] border border-[#1f2937] text-[#94a3b8] hover:text-white'
              }`}
            >
              All Notepads ({notes.length})
            </button>

            <button
              onClick={() => dispatch(setActiveFolder('root'))}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeFolderId === 'root'
                  ? 'bg-[#38bdf8] text-black font-bold'
                  : 'bg-[#111827] border border-[#1f2937] text-[#94a3b8] hover:text-white'
              }`}
            >
              Main Notepad
            </button>

            {folders.map((folder) => (
              <div
                key={folder._id}
                onClick={() => dispatch(setActiveFolder(folder._id))}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                  activeFolderId === folder._id
                    ? 'bg-[#38bdf8] text-black font-bold'
                    : 'bg-[#111827] border border-[#1f2937] text-[#cbd5e1] hover:border-[#38bdf8]/50'
                }`}
              >
                <span>📁 {folder.name}</span>
                <button
                  type="button"
                  onClick={(e) => handleDeleteFolder(e, folder._id)}
                  className={`text-[10px] px-1.5 rounded hover:bg-red-500 hover:text-white ${
                    activeFolderId === folder._id ? 'text-black' : 'text-[#64748b]'
                  }`}
                  title="Delete Folder"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notepads Grid */}
        {loading ? (
          <p className="text-center text-sm text-[#94a3b8] py-16">Loading your notepads...</p>
        ) : visibleNotes.length === 0 ? (
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-12 text-center space-y-2">
            <p className="text-base font-semibold text-[#cbd5e1]">No notepads here yet</p>
            <p className="text-xs text-[#64748b]">
              Tap the <strong className="text-[#38bdf8]">+</strong> button in the bottom-right corner to create a new named notepad with voice or images.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleNotes.map((note) => {
              const folderLabel = getFolderName(note.folderId);
              const snippetText = getPlainTextPreview(note.topContent);

              return (
                <div
                  key={note._id}
                  onClick={() => openEditNoteModal(note)}
                  className="bg-[#111827] border border-[#1f2937] hover:border-[#38bdf8]/60 rounded-2xl p-5 flex flex-col justify-between transition cursor-pointer shadow-lg group"
                >
                  <div>
                    {/* Title & Folder Tag */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base font-bold text-white group-hover:text-[#38bdf8] transition line-clamp-1">
                        {note.title}
                      </h3>
                      {folderLabel && (
                        <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-[#1f2937] text-[#38bdf8] font-medium">
                          📁 {folderLabel}
                        </span>
                      )}
                    </div>

                    {/* Clean Text Snippet Preview */}
                    {snippetText && (
                      <p className="text-xs text-[#cbd5e1] line-clamp-3 mb-3 leading-relaxed">
                        {snippetText}
                      </p>
                    )}

                    {/* Inline Thumbnail Preview */}
                    {note.imageUrl && (
                      <div className="my-2.5 rounded-xl overflow-hidden border border-[#1f2937] bg-black/40 h-36 flex items-center justify-center">
                        <img
                          src={note.imageUrl}
                          alt={note.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Legacy Bottom Content Preview (if any) */}
                    {note.bottomContent && (
                      <p className="text-xs text-[#94a3b8] line-clamp-2 whitespace-pre-line mt-2 leading-relaxed">
                        {note.bottomContent}
                      </p>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 mt-4 border-t border-[#1f2937] flex items-center justify-between text-[11px] text-[#64748b]">
                    <span>
                      {new Date(note.updatedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${note.title}"?`)) {
                          dispatch(deleteNote(note._id));
                        }
                      }}
                      className="text-red-400 hover:underline font-semibold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating '+' Button in the Bottom-Right Corner */}
      <button
        onClick={openNewNoteModal}
        aria-label="Create New Notepad"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#38bdf8] hover:bg-[#0284c7] text-black text-3xl font-bold shadow-[0_8px_30px_rgba(56,189,248,0.45)] flex items-center justify-center transition transform hover:scale-105 active:scale-95 cursor-pointer"
      >
        +
      </button>

      {/* Named Note Editor Modal with Inline Image & Microphone */}
      <NoteEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        existingNote={editingNote}
        defaultFolderId={activeFolderId}
      />
    </div>
  );
}