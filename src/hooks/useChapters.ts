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
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedChapters: Chapter[] = data.map(chapter => ({
        id: chapter.id,
        title: chapter.title,
        subtitle: chapter.subtitle || undefined,
        author: chapter.author,
        content: chapter.content,
        category: chapter.category,
        tags: chapter.tags || [],
        difficulty: chapter.difficulty,
        estimatedReadTime: chapter.estimated_read_time
      }));

      setChapters(formattedChapters);
    } catch (err) {
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
        title: data.title,
        subtitle: data.subtitle || undefined,
        author: data.author,
        content: data.content,
        category: data.category,
        tags: data.tags || [],
        difficulty: data.difficulty,
        estimatedReadTime: data.estimated_read_time
      };

      setChapters(prev => [newChapter, ...prev]);
      return newChapter;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add chapter');
    }
  };

  const updateChapter = async (id: string, updates: Partial<Omit<Chapter, 'id'>>) => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .update({
          ...(updates.title && { title: updates.title }),
          ...(updates.subtitle !== undefined && { subtitle: updates.subtitle || null }),
          ...(updates.author && { author: updates.author }),
          ...(updates.content && { content: updates.content }),
          ...(updates.category && { category: updates.category }),
          ...(updates.tags && { tags: updates.tags }),
          ...(updates.difficulty && { difficulty: updates.difficulty }),
          ...(updates.estimatedReadTime && { estimated_read_time: updates.estimatedReadTime })
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedChapter: Chapter = {
        id: data.id,
        title: data.title,
        subtitle: data.subtitle || undefined,
        author: data.author,
        content: data.content,
        category: data.category,
        tags: data.tags || [],
        difficulty: data.difficulty,
        estimatedReadTime: data.estimated_read_time
      };

      setChapters(prev => prev.map(chapter => 
        chapter.id === id ? updatedChapter : chapter
      ));

      return updatedChapter;
    } catch (err) {
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