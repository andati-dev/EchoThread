import React from 'react'

import React, { useEffect, useState } from 'react'
import api, { setToken } from './api'
import CreatePost from './CreatePost'
import { ToastProvider, useToast } from './contexts/ToastContext'

export default function App() {
  const [token, setTokenLocal] = useState<string | null>(() => localStorage.getItem('token'));
  const { addToast } = useToast()
  const [loadingPosts, setLoadingPosts] = useState(false)

  useEffect(() => {
    setToken(token);
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  const loginDemo = async () => {
    try {
      const res = await api.post('/auth/register', { email: `demo-${Date.now()}@example.com`, password: 'password' });
      setTokenLocal(res.data.token);
      setToken(res.data.token);
      fetchPosts();
    } catch (err: any) {
      console.error(err);
    }
  };

  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchPosts = async (p = page) => {
    setLoadingPosts(true)
    try {
      const res = await api.get('/posts', { params: { page: p, limit } });
      setPosts(res.data);
      setPage(p);
    } catch (err: any) {
      console.error(err);
      addToast({ type: 'error', message: err?.response?.data?.error || 'Failed to load posts' })
    } finally { setLoadingPosts(false) }
  };

  const votePost = async (postId: number, value: number) => {
    // optimistic update
    setPosts((prev) => prev.map((post) => {
      if (post.id !== postId) return post;
      const prevVote = post.userVote || 0;
      let newVote = value;
      let newScore = post.score;
      if (prevVote === value) {
        // toggle off
        newVote = 0;
        newScore = post.score - value;
      } else if (prevVote === 0) {
        newScore = post.score + value;
      } else {
        // flipping
        newScore = post.score + value * 2;
      }
      return { ...post, userVote: newVote, score: newScore };
    }));

    try {
      const res = await api.post(`/posts/${postId}/vote`, { value });
      setPosts((prev) => prev.map((post) => post.id === postId ? { ...post, score: res.data.score, userVote: res.data.userVote } : post));
    } catch (err) {
      console.error(err);
      // revert by refetching the page
      fetchPosts(1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold">Reddit Clone (WIP)</h1>
        <p className="mt-4">UI and API integration coming next.</p>
        <div className="mt-4 flex items-center gap-3">
          <a className="text-sm text-blue-600" href="/">Home</a>
          {token ? (
            <div className="flex items-center gap-3">
              <div className="text-sm text-green-600">Logged in</div>
              <button className="mt-0 px-3 py-1 bg-red-500 text-white rounded" onClick={() => { setTokenLocal(null); setToken(null); }}>Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <a className="text-sm text-blue-600" href="/login">Login</a>
              <a className="text-sm text-green-600" href="/register">Register</a>
              <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={loginDemo}>Demo</button>
            </div>
          )}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent posts</h2>
            <div className="flex items-center gap-3">
              <button className="text-sm text-blue-600" onClick={() => fetchPosts(1)}>Refresh</button>
              <div className="text-sm text-gray-600">Page {page}</div>
              <button className="px-2 py-1 bg-slate-100 rounded" onClick={() => fetchPosts(Math.max(1, page - 1))}>Prev</button>
              <button className="px-2 py-1 bg-slate-100 rounded" onClick={() => fetchPosts(page + 1)}>Next</button>
            </div>
          </div>

          {token && (
            <CreatePost onCreated={() => fetchPosts(1)} />
          )}

          <ul className="mt-3 space-y-3">
            {loadingPosts ? (
              <li className="p-3 bg-white rounded shadow-sm">Loading posts…</li>
            ) : posts.length === 0 ? (
              <li className="p-3 bg-white rounded shadow-sm">No posts yet</li>
            ) : (
              posts.map((p) => (
                <li key={p.id} className="p-3 bg-white rounded shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <a className="font-medium text-blue-700" href={`/posts/${p.id}`}>{p.title}</a>
                      <div className="text-xs text-gray-500">by {p.author?.email || 'unknown'}</div>
                    </div>
                    <div className="text-sm text-gray-700 flex items-center gap-3">
                      <button className={`px-2 py-1 rounded ${p.userVote === 1 ? 'bg-green-600 text-white' : 'bg-slate-100'}`} onClick={() => votePost(p.id, 1)}>▲</button>
                      <div>{p.score ?? 0}</div>
                      <button className={`px-2 py-1 rounded ${p.userVote === -1 ? 'bg-red-600 text-white' : 'bg-slate-100'}`} onClick={() => votePost(p.id, -1)}>▼</button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </main>
    </div>
  )
}
