import { useState, useEffect, useCallback } from 'react';
import { tagsApi } from '../api/tags.api';
import type { Tag, TagSummary } from '../types';

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTags = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tagsApi.getAll();
      setTags(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  return { tags, loading, reload: loadTags };
}

export function useTagsSummary() {
  const [summary, setSummary] = useState<TagSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tagsApi.getSummary();
      setSummary(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return { summary, loading, reload: loadSummary };
}
