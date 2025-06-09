import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Eye, Settings } from 'lucide-react';
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
  const { chapters, loading, addChapter, updateChapter, deleteChapter } = useChapters();
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Chapter List */}
          <div className="w-1/2 border-r flex flex-col">
            <div className="p-4 border-b bg-gray-50">
              <button
                onClick={handleCreate}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Chapter</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading chapters...</div>
              ) : chapters.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No chapters found</div>
              ) : (
                <div className="space-y-3">
                  {chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className={`p-4 border rounded-lg transition-all ${
                        editingChapter?.id === chapter.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">{chapter.title}</h3>
                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={() => onChapterSelect(chapter)}
                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(chapter)}
                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(chapter)}
                            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                        <span>{chapter.author}</span>
                        <span>•</span>
                        <span>{chapter.estimatedReadTime} min</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(chapter.difficulty)}`}>
                          {chapter.difficulty}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-500">
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
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {editingChapter ? 'Edit Chapter' : 'Create New Chapter'}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{saving ? 'Saving...' : 'Save'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter chapter title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={form.subtitle}
                      onChange={(e) => setForm(prev => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter subtitle (optional)"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Author
                      </label>
                      <input
                        type="text"
                        value={form.author}
                        onChange={(e) => setForm(prev => ({ ...prev, author: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Author name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={form.category}
                        onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Technology, Psychology"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Difficulty
                      </label>
                      <select
                        value={form.difficulty}
                        onChange={(e) => setForm(prev => ({ ...prev, difficulty: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Read Time (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={form.estimatedReadTime}
                        onChange={(e) => setForm(prev => ({ ...prev, estimatedReadTime: parseInt(e.target.value) || 5 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={form.tags}
                      onChange={(e) => setForm(prev => ({ ...prev, tags: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., productivity, focus, habits"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content *
                    </label>
                    <textarea
                      value={form.content}
                      onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Select a chapter to edit or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};