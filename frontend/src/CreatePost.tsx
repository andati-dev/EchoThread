import React, { useState } from 'react'
import api from './api'
import { useToast } from './contexts/ToastContext'

export default function CreatePost({ onCreated }: { onCreated?: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return addToast({ type: 'error', message: 'Title is required' });
    setLoading(true);
    try {
      await api.post('/posts', { title, content });
      setTitle('');
      setContent('');
      addToast({ type: 'success', message: 'Post created' })
      onCreated?.();
    } catch (err: any) {
      console.error(err);
      addToast({ type: 'error', message: err?.response?.data?.error || 'Failed to create post' })
    } finally { setLoading(false); }
  };

  return (
    <form className="mt-4 p-3 bg-white rounded shadow-sm" onSubmit={submit}>
      <div className="mb-2">
        <input className="w-full border px-2 py-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      </div>
      <div className="mb-2">
        <textarea className="w-full border px-2 py-1" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content (optional)" />
      </div>
      <div>
        <button className="px-3 py-1 bg-green-600 text-white rounded" type="submit" disabled={loading}>{loading ? 'Posting…' : 'Post'}</button>
      </div>
    </form>
  )
}
