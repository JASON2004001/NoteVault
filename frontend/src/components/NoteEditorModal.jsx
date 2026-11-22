import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNote, updateNote } from '../store/vaultSlice';
import WordDocumentEditor from './WordDocumentEditor';

export default function NoteEditorModal({ isOpen, onClose, existingNote, defaultFolderId }) {
  const dispatch = useDispatch();
  const { folders, saving } = useSelector((state) => state.vault);

  const [title, setTitle] = useState('');
  const [folderId, setFolderId] = useState('');
  const [documentHtml, setDocumentHtml] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title || '');
      setFolderId(existingNote.folderId || '');
      // Combine legacy fields seamlessly if opening an older note
      if (existingNote.imageUrl || existingNote.bottomContent) {
        const imgTag = existingNote.imageUrl
          ? `<img src="${existingNote.imageUrl}" style="width:60%;max-width:100%;display:block;margin:12px auto;border-radius:8px;" />`
          : '';
        setDocumentHtml(
          `${existingNote.topContent || ''}${imgTag}${existingNote.bottomContent || ''}`
        );
      } else {
        setDocumentHtml(existingNote.topContent || '');
      }
    } else {
      setTitle('');
      setFolderId(
        defaultFolderId && defaultFolderId !== 'all' && defaultFolderId !== 'root'
          ? defaultFolderId
          : ''
      );
      setDocumentHtml('');
    }
    setFormError('');
  }, [existingNote, defaultFolderId, isOpen]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setFormError('Please give a name to your notepad before saving.');
      return;
    }

    // Extract first image src as cover thumbnail for dashboard preview cards
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = documentHtml;
    const firstImg = tempDiv.querySelector('img');
    const previewImage = firstImg ? firstImg.getAttribute('src') : '';

    const payload = {
      title: title.trim(),
      folderId: folderId || null,
      topContent: documentHtml,
      imageUrl: previewImage,
      bottomContent: '',
    };

    if (existingNote) {
      await dispatch(updateNote({ id: existingNote._id, noteData: payload }));
    } else {
      await dispatch(createNote(payload));
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-3xl bg-[#111827] border border-[#1f2937] rounded-t-3xl sm:rounded-2xl max-h-[95vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#1f2937] flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#38bdf8]">
              {existingNote ? 'Edit Notepad' : 'Create New Notepad'}
            </h2>
            <p className="text-[11px] text-[#94a3b8]">
              Type, speak, paste (Ctrl+V), drag & drop, or import images — tap any image to resize
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1f2937] text-[#94a3b8] hover:text-white flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs">
              {formError}
            </div>
          )}

          {/* Notepad Name & Folder */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                Notepad Name *
              </label>
              <input
                type="text"
                required
                placeholder="Give a name to this notepad..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-[#1f2937] text-sm text-white focus:outline-none focus:border-[#38bdf8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                Folder
              </label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#090d16] border border-[#1f2937] text-sm text-white focus:outline-none focus:border-[#38bdf8]"
              >
                <option value="">Main Notepad (No Folder)</option>
                {folders.map((f) => (
                  <option key={f._id} value={f._id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* MS Word-Style Rich Document Editor */}
          <WordDocumentEditor
            initialHtml={documentHtml}
            onChange={setDocumentHtml}
            onError={setFormError}
          />

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#1f2937] text-xs font-semibold text-[#cbd5e1] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#38bdf8] hover:bg-[#0284c7] text-black font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              {saving ? 'Saving...' : existingNote ? 'Save Changes' : 'Store Notepad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}