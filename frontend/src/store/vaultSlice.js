import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = 'http://localhost:5000/api';

// 1. Fetch All Folders
export const fetchFolders = createAsyncThunk(
  'vault/fetchFolders',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`${API_BASE}/folders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 2. Create New Folder
export const createFolder = createAsyncThunk(
  'vault/createFolder',
  async (name, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`${API_BASE}/folders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 3. Delete Folder
export const deleteFolder = createAsyncThunk(
  'vault/deleteFolder',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`${API_BASE}/folders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return rejectWithValue('Failed to delete folder');
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 4. Fetch All Notes
export const fetchNotes = createAsyncThunk(
  'vault/fetchNotes',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`${API_BASE}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 5. Create New Named Note
export const createNote = createAsyncThunk(
  'vault/createNote',
  async (noteData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(noteData),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 6. Update Existing Note
export const updateNote = createAsyncThunk(
  'vault/updateNote',
  async ({ id, noteData }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`${API_BASE}/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(noteData),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 7. Delete Single Note
export const deleteNote = createAsyncThunk(
  'vault/deleteNote',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`${API_BASE}/notes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return rejectWithValue('Failed to delete note');
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const vaultSlice = createSlice({
  name: 'vault',
  initialState: {
    folders: [],
    notes: [],
    activeFolderId: 'all', // 'all' | 'root' | '<folder._id>'
    loading: false,
    saving: false,
  },
  reducers: {
    setActiveFolder: (state, action) => {
      state.activeFolderId = action.payload;
    },
    resetVaultState: (state) => {
      state.folders = [];
      state.notes = [];
      state.activeFolderId = 'all';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFolders.fulfilled, (state, action) => {
        state.folders = action.payload;
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        state.folders.unshift(action.payload);
      })
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.folders = state.folders.filter((f) => f._id !== action.payload);
        state.notes = state.notes.filter((n) => n.folderId !== action.payload);
        if (state.activeFolderId === action.payload) {
          state.activeFolderId = 'all';
        }
      })
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload;
      })
      .addCase(createNote.pending, (state) => {
        state.saving = true;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.saving = false;
        state.notes.unshift(action.payload);
      })
      .addCase(createNote.rejected, (state) => {
        state.saving = false;
      })
      .addCase(updateNote.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.saving = false;
        const idx = state.notes.findIndex((n) => n._id === action.payload._id);
        if (idx !== -1) state.notes[idx] = action.payload;
      })
      .addCase(updateNote.rejected, (state) => {
        state.saving = false;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter((n) => n._id !== action.payload);
      });
  },
});

export const { setActiveFolder, resetVaultState } = vaultSlice.actions;
export default vaultSlice.reducer;