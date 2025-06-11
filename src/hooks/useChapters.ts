import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Chapter } from '../types';

export const useChapters = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedChapters: Chapter[] = (data || []).map(chapter => ({
        id: chapter.id,
        title: chapter.name || chapter.title || 'Untitled',
        subtitle: chapter.subtitle || undefined,
        author: chapter.author || 'Unknown Author',
        content: chapter.content || '',
        category: chapter.category || 'Uncategorized',
        tags: Array.isArray(chapter.tags) ? chapter.tags : [],
        difficulty: chapter.difficulty || 'Beginner',
        estimatedReadTime: chapter.estimated_read_time || chapter.estimatedReadTime || 5
      }));

      setChapters(formattedChapters);
    } catch (err) {
      console.error('Error fetching chapters:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addChapter = async (chapter: Omit<Chapter, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .insert({
          name: chapter.title,
          title: chapter.title,
          subtitle: chapter.subtitle || null,
          author: chapter.author,
          content: chapter.content,
          category: chapter.category,
          tags: chapter.tags,
          difficulty: chapter.difficulty,
          estimated_read_time: chapter.estimatedReadTime
        })
        .select()
        .single();

      if (error) throw error;

      const newChapter: Chapter = {
        id: data.id,
        title: data.name || data.title,
        subtitle: data.subtitle || undefined,
        author: data.author,
        content: data.content,
        category: data.category,
        tags: Array.isArray(data.tags) ? data.tags : [],
        difficulty: data.difficulty,
        estimatedReadTime: data.estimated_read_time
      };

      setChapters(prev => [newChapter, ...prev]);
      return newChapter;
    } catch (err) {
      console.error('Error adding chapter:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to add chapter');
    }
  };

  const updateChapter = async (id: string, updates: Partial<Omit<Chapter, 'id'>>) => {
    try {
      const updateData: any = {};
      
      if (updates.title) {
        updateData.name = updates.title;
        updateData.title = updates.title;
      }
      if (updates.subtitle !== undefined) {
        updateData.subtitle = updates.subtitle || null;
      }
      if (updates.author) {
        updateData.author = updates.author;
      }
      if (updates.content) {
        updateData.content = updates.content;
      }
      if (updates.category) {
        updateData.category = updates.category;
      }
      if (updates.tags) {
        updateData.tags = updates.tags;
      }
      if (updates.difficulty) {
        updateData.difficulty = updates.difficulty;
      }
      if (updates.estimatedReadTime) {
        updateData.estimated_read_time = updates.estimatedReadTime;
      }

      const { data, error } = await supabase
        .from('chapters')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedChapter: Chapter = {
        id: data.id,
        title: data.name || data.title,
        subtitle: data.subtitle || undefined,
        author: data.author,
        content: data.content,
        category: data.category,
        tags: Array.isArray(data.tags) ? data.tags : [],
        difficulty: data.difficulty,
        estimatedReadTime: data.estimated_read_time
      };

      setChapters(prev => prev.map(chapter => 
        chapter.id === id ? updatedChapter : chapter
      ));

      return updatedChapter;
    } catch (err) {
      console.error('Error updating chapter:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to update chapter');
    }
  };

  const deleteChapter = async (id: string) => {
    try {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setChapters(prev => prev.filter(chapter => chapter.id !== id));
    } catch (err) {
      console.error('Error deleting chapter:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to delete chapter');
    }
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  return {
    chapters,
    loading,
    error,
    addChapter,
    updateChapter,
    deleteChapter,
    refetch: fetchChapters
  };
};