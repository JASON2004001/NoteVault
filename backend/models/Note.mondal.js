import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null, // null means stored in the main root workspace
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    topContent: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '', // Stores inline Base64 image or image URL in the middle
    },
    bottomContent: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Note', noteSchema);