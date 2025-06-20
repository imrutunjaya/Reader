import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Eye, Settings, RefreshCw, Upload, FileText } from 'lucide-react';
import { Chapter } from '../types';
import { useChapters } from '../hooks/useChapters';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onChapterSelect: (chapter: Chapter) => void;
}

interface ChapterForm {
  title: string;
  subtitle: string;
  author: string;
  content: string;
  category: string;
  tags: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedReadTime: number;
}

const emptyForm: ChapterForm = {
  title: '',
  subtitle: '',
  author: '',
  content: '',
  category: '',
  tags: '',
  difficulty: 'Beginner',
  estimatedReadTime: 5
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, onChapterSelect }) => {
  const { chapters, loading, addChapter, updateChapter, deleteChapter, refetch } = useChapters();
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<ChapterForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setForm({
      title: chapter.title,
      subtitle: chapter.subtitle || '',
      author: chapter.author,
      content: chapter.content,
      category: chapter.category,
      tags: chapter.tags.join(', '),
      difficulty: chapter.difficulty,
      estimatedReadTime: chapter.estimatedReadTime
    });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingChapter(null);
    setForm(emptyForm);
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      alert('Title and content are required');
      return;
    }

    setSaving(true);
    try {
      const chapterData = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || undefined,
        author: form.author.trim() || 'Anonymous',
        content: form.content.trim(),
        category: form.category.trim() || 'General',
        tags: form.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        difficulty: form.difficulty,
        estimatedReadTime: form.estimatedReadTime
      };

      if (editingChapter) {
        await updateChapter(editingChapter.id, chapterData);
      } else {
        await addChapter(chapterData);
      }

      setEditingChapter(null);
      setIsCreating(false);
      setForm(emptyForm);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save chapter');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (chapter: Chapter) => {
    if (!confirm(`Are you sure you want to delete "${chapter.title}"?`)) {
      return;
    }

    try {
      await deleteChapter(chapter.id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete chapter');
    }
  };

  const handleCancel = () => {
    setEditingChapter(null);
    setIsCreating(false);
    setForm(emptyForm);
  };

  const handleRefresh = () => {
    refetch();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30';
      case 'Intermediate': return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-500/30';
      case 'Advanced': return 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300 border-gray-500/30';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
              <p className="text-white/60">Manage your knowledge library</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="glass-button p-3 hover:bg-white/20 transition-colors"
              title="Refresh chapters"
            >
              <RefreshCw className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={onClose}
              className="glass-button p-3 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Chapter List */}
          <div className="w-1/2 border-r border-white/10 flex flex-col">
            <div className="p-6 border-b border-white/10">
              <button
                onClick={handleCreate}
                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-4 rounded-xl transition-all duration-300 font-medium glow-hover"
              >
                <Plus className="w-5 h-5" />
                <span>Add New Chapter</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="text-center py-12 text-white/60">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-4"></div>
                  Loading chapters...
                </div>
              ) : chapters.length === 0 ? (
                <div className="text-center py-12 text-white/60">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-white/30" />
                  <p className="text-lg">No chapters found</p>
                  <p className="text-sm">Create your first chapter to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className={`glass-card p-6 transition-all cursor-pointer hover:bg-white/10 ${
                        editingChapter?.id === chapter.id
                          ? 'border-blue-500/50 bg-blue-500/10 glow'
                          : 'border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-semibold text-white line-clamp-2 flex-1 mr-3">{chapter.title}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onChapterSelect(chapter)}
                            className="glass-button p-2 text-white/60 hover:text-blue-400 transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(chapter)}
                            className="glass-button p-2 text-white/60 hover:text-blue-400 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(chapter)}
                            className="glass-button p-2 text-white/60 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 text-sm text-white/60 mb-3">
                        <span>{chapter.author}</span>
                        <span>•</span>
                        <span>{chapter.estimatedReadTime} min</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-full text-xs border ${getDifficultyColor(chapter.difficulty)}`}>
                          {chapter.difficulty}
                        </span>
                      </div>
                      
                      <div className="text-sm text-white/50">
                        {chapter.category} • {chapter.tags.slice(0, 3).join(', ')}
                        {chapter.tags.length > 3 && ` +${chapter.tags.length - 3} more`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Editor */}
          <div className="w-1/2 flex flex-col">
            {(editingChapter || isCreating) ? (
              <>
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      {editingChapter ? 'Edit Chapter' : 'Create New Chapter'}
                    </h3>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleCancel}
                        className="glass-button px-4 py-2 text-white/70 hover:text-white transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gradient-to-r from-green-500/80 to-emerald-500/80 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 font-medium flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>{saving ? 'Saving...' : 'Save'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                      className="glass-input w-full px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Enter chapter title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={form.subtitle}
                      onChange={(e) => setForm(prev => ({ ...prev, subtitle: e.target.value }))}
                      className="glass-input w-full px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Enter subtitle (optional)"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Author
                      </label>
                      <input
                        type="text"
                        value={form.author}
                        onChange={(e) => setForm(prev => ({ ...prev, author: e.target.value }))}
                        className="glass-input w-full px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Author name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Category
                      </label>
                      <input
                        type="text"
                        value={form.category}
                        onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                        className="glass-input w-full px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="e.g., Technology, Psychology"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Difficulty
                      </label>
                      <select
                        value={form.difficulty}
                        onChange={(e) => setForm(prev => ({ ...prev, difficulty: e.target.value as any }))}
                        className="glass-input w-full px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="Beginner" className="bg-black text-white">Beginner</option>
                        <option value="Intermediate" className="bg-black text-white">Intermediate</option>
                        <option value="Advanced" className="bg-black text-white">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Read Time (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={form.estimatedReadTime}
                        onChange={(e) => setForm(prev => ({ ...prev, estimatedReadTime: parseInt(e.target.value) || 5 }))}
                        className="glass-input w-full px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={form.tags}
                      onChange={(e) => setForm(prev => ({ ...prev, tags: e.target.value }))}
                      className="glass-input w-full px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="e.g., productivity, focus, habits"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Content *
                    </label>
                    <textarea
                      value={form.content}
                      onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                      className="glass-input w-full px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                      rows={20}
                      placeholder="Write your chapter content here...

You can use markdown-like formatting:
## Section Heading
**Bold text**
Regular paragraphs separated by double line breaks"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-white/60">
                <div className="text-center">
                  <Upload className="w-20 h-20 mx-auto mb-6 text-white/30" />
                  <p className="text-xl mb-2">Select a chapter to edit or create a new one</p>
                  <p className="text-sm text-white/40">Use the buttons above to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};