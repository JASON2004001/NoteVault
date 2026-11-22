import React, { useRef, useState, useEffect } from 'react';

export default function WordDocumentEditor({ initialHtml, onChange, onError }) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  // Selected image for MS Word-style resizing & alignment
  const [selectedImg, setSelectedImg] = useState(null);
  const [imgWidthPercent, setImgWidthPercent] = useState(60);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Live Voice Dictation
  const [isListening, setIsListening] = useState(false);
  const [interimSpeech, setInterimSpeech] = useState('');
  const recognitionRef = useRef(null);

  // Populate initial HTML when opening a note
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (initialHtml || '')) {
      editorRef.current.innerHTML = initialHtml || '';
    }
    setSelectedImg(null);
  }, [initialHtml]);

  useEffect(() => {
    return () => stopListening();
  }, []);

  const emitChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Convert File/Blob to Base64 and insert at cursor position
  const insertImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      onError('Please choose a valid image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      onError('Image must be smaller than 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      insertImageAtCursor(e.target.result);
      onError('');
    };
    reader.readAsDataURL(file);
  };

  const insertImageAtCursor = (src) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    const img = document.createElement('img');
    img.src = src;
    img.style.width = '60%';
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.display = 'block';
    img.style.margin = '12px auto';
    img.style.borderRadius = '8px';
    img.style.cursor = 'pointer';
    img.className = 'notevault-inline-img';

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editor.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(img);

      // Move cursor right after the inserted image so user can keep typing below
      const br = document.createElement('div');
      br.innerHTML = '<br>';
      img.after(br);

      const newRange = document.createRange();
      newRange.setStart(br, 0);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      editor.appendChild(img);
      const br = document.createElement('div');
      br.innerHTML = '<br>';
      editor.appendChild(br);
    }

    selectImageElement(img);
    emitChange();
  };

  // 1. Handle Paste (Ctrl+V or mobile paste)
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault();
        const file = items[i].getAsFile();
        insertImageFile(file);
        return;
      }
    }
  };

  // 2. Handle Drag & Drop onto editor
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      insertImageFile(files[0]);
    }
  };

  // 3. Select an image inside the editor to resize/align like MS Word
  const selectImageElement = (imgEl) => {
    // Clear previous outline
    if (editorRef.current) {
      editorRef.current.querySelectorAll('img').forEach((el) => {
        el.style.outline = 'none';
      });
    }

    if (!imgEl) {
      setSelectedImg(null);
      return;
    }

    imgEl.style.outline = '2px solid #38bdf8';
    setSelectedImg(imgEl);

    const currentW = parseInt(imgEl.style.width, 10);
    setImgWidthPercent(!isNaN(currentW) ? currentW : 60);
  };

  const handleEditorClick = (e) => {
    if (e.target.tagName === 'IMG') {
      selectImageElement(e.target);
    } else {
      selectImageElement(null);
    }
  };

  // Resize selected image (Slider / Quick Presets)
  const resizeSelectedImage = (newPercent) => {
    if (!selectedImg) return;
    const clamped = Math.max(15, Math.min(100, Number(newPercent)));
    selectedImg.style.width = `${clamped}%`;
    setImgWidthPercent(clamped);
    emitChange();
  };

  // Align selected image (Left, Center, Right)
  const alignSelectedImage = (alignment) => {
    if (!selectedImg) return;
    selectedImg.style.display = 'block';
    if (alignment === 'left') {
      selectedImg.style.margin = '12px auto 12px 0';
    } else if (alignment === 'center') {
      selectedImg.style.margin = '12px auto';
    } else if (alignment === 'right') {
      selectedImg.style.margin = '12px 0 12px auto';
    }
    emitChange();
  };

  const removeSelectedImage = () => {
    if (!selectedImg) return;
    selectedImg.remove();
    setSelectedImg(null);
    emitChange();
  };

  // Basic text formatting commands (Bold, Italic, Underline, Bullet List)
  const execFormat = (cmd) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, null);
    emitChange();
  };

  // Live Speech-to-Text at Cursor
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimSpeech('');
  };

  const toggleMicrophone = () => {
    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError('Voice typing is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    onError('');
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += piece + ' ';
        } else {
          interimTranscript += piece;
        }
      }

      setInterimSpeech(interimTranscript);

      if (finalTranscript && editorRef.current) {
        editorRef.current.focus();
        document.execCommand('insertText', false, finalTranscript);
        emitChange();
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        onError('Microphone access blocked. Allow microphone permission in browser settings.');
      }
      stopListening();
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimSpeech('');
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="bg-[#090d16] border border-[#1f2937] rounded-2xl overflow-hidden flex flex-col">
      {/* MS Word-Style Formatting & Insert Toolbar */}
      <div className="p-2.5 bg-[#0f172a] border-b border-[#1f2937] flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => execFormat('bold')}
            className="w-8 h-8 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-xs font-bold text-white cursor-pointer"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => execFormat('italic')}
            className="w-8 h-8 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-xs italic font-serif text-white cursor-pointer"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => execFormat('underline')}
            className="w-8 h-8 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-xs underline text-white cursor-pointer"
            title="Underline"
          >
            U
          </button>
          <button
            type="button"
            onClick={() => execFormat('insertUnorderedList')}
            className="px-2.5 h-8 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-xs text-white cursor-pointer"
            title="Bullet List"
          >
            • List
          </button>

          {/* Import / Insert Image Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 h-8 rounded-lg bg-[#38bdf8]/15 hover:bg-[#38bdf8]/25 text-[#38bdf8] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
          >
            <span>🖼</span>
            <span>Import Image</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                insertImageFile(e.target.files[0]);
                e.target.value = '';
              }
            }}
            className="hidden"
          />
        </div>

        {/* Live Voice Dictation Button */}
        <button
          type="button"
          onClick={toggleMicrophone}
          className={`px-3 h-8 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
            isListening
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-[#1e293b] text-[#38bdf8] hover:bg-[#38bdf8] hover:text-black'
          }`}
        >
          <span>🎙</span>
          <span>{isListening ? 'Listening... (Stop)' : 'Speak'}</span>
        </button>
      </div>

      {/* MS Word Image Resize & Alignment Bar (Appears whenever user clicks an image) */}
      {selectedImg && (
        <div className="p-2.5 bg-[#1e293b] border-b border-[#38bdf8]/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#38bdf8]">Image Size:</span>
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => resizeSelectedImage(pct)}
                className={`px-2 py-1 rounded font-semibold cursor-pointer ${
                  imgWidthPercent === pct
                    ? 'bg-[#38bdf8] text-black'
                    : 'bg-[#0f172a] text-[#cbd5e1] hover:text-white'
                }`}
              >
                {pct}%
              </button>
            ))}
            <input
              type="range"
              min="15"
              max="100"
              value={imgWidthPercent}
              onChange={(e) => resizeSelectedImage(e.target.value)}
              className="w-24 accent-[#38bdf8] cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => alignSelectedImage('left')}
              className="px-2 py-1 rounded bg-[#0f172a] text-[#cbd5e1] hover:text-white cursor-pointer"
            >
              Left
            </button>
            <button
              type="button"
              onClick={() => alignSelectedImage('center')}
              className="px-2 py-1 rounded bg-[#0f172a] text-[#cbd5e1] hover:text-white cursor-pointer"
            >
              Center
            </button>
            <button
              type="button"
              onClick={() => alignSelectedImage('right')}
              className="px-2 py-1 rounded bg-[#0f172a] text-[#cbd5e1] hover:text-white cursor-pointer"
            >
              Right
            </button>
            <button
              type="button"
              onClick={removeSelectedImage}
              className="px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-semibold cursor-pointer ml-1"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Live Speech Preview */}
      {isListening && interimSpeech && (
        <div className="px-4 py-1.5 bg-[#38bdf8]/10 text-xs text-[#38bdf8] italic">
          Hearing: "{interimSpeech}..."
        </div>
      )}

      {/* Editable MS Word Document Canvas (Supports Typing, Pasting Images, & Drag-and-Drop) */}
      <div
        className={`relative transition ${
          isDraggingFile ? 'ring-2 ring-[#38bdf8] bg-[#38bdf8]/5' : ''
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingFile(true);
        }}
        onDragLeave={() => setIsDraggingFile(false)}
        onDrop={handleDrop}
      >
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onPaste={handlePaste}
          onClick={handleEditorClick}
          data-placeholder="Start typing your note here... You can paste (Ctrl+V), drag & drop, or import images anywhere, and click any image to resize it."
          className="min-h-[300px] sm:min-h-[360px] p-4 sm:p-6 text-sm sm:text-base text-[#f1f5f9] focus:outline-none leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-[#64748b] empty:before:pointer-events-none"
        />

        {isDraggingFile && (
          <div className="absolute inset-0 bg-[#090d16]/85 flex items-center justify-center pointer-events-none">
            <p className="text-sm font-bold text-[#38bdf8]">
              Drop image here to insert into your notepad
            </p>
          </div>
        )}
      </div>
    </div>
  );
}