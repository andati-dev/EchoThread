import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'
import { useToast } from '../contexts/ToastContext'

function CommentNode({ comment, onVote }: any) {
  const [score, setScore] = useState(comment.score ?? 0)
  const [userVote, setUserVote] = useState(comment.userVote ?? 0)
  const vote = async (val: number) => {
    // optimistic
    const prevVote = userVote || 0
    let newVote = val
    let newScore = score
    if (prevVote === val) {
      newVote = 0; newScore = score - val
    } else if (prevVote === 0) {
      newScore = score + val
    } else {
      newScore = score + val * 2
    }
    setUserVote(newVote); setScore(newScore)

    try {
      const res = await api.post(`/comments/${comment.id}/vote`, { value: val })
      setScore(res.data.score)
      setUserVote(res.data.userVote)
      onVote?.()
    } catch (err) { console.error(err); onVote?.() }
  }

  return (
    <div className="pl-4 border-l ml-2 mt-2">
      <div className="text-sm">{comment.content}</div>
      <div className="text-xs text-gray-500">by {comment.author?.email}</div>
      <div className="mt-1 flex items-center gap-2">
        <button className={`${userVote === 1 ? 'text-white bg-green-600 px-1 rounded' : 'text-green-600'}`} onClick={() => vote(1)}>▲</button>
        <div className="text-sm">{score}</div>
        <button className={`${userVote === -1 ? 'text-white bg-red-600 px-1 rounded' : 'text-red-600'}`} onClick={() => vote(-1)}>▼</button>
      </div>
      {comment.children?.map((c: any) => <CommentNode key={c.id} comment={c} onVote={onVote} />)}
    </div>
  )
}

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null)
  const [comment, setComment] = useState('')

  const fetch = async () => {
    try {
      const res = await api.get(`/posts/${id}`)
      setPost(res.data)
    } catch (err) { console.error(err) }
  }

  useEffect(() => { fetch() }, [id])
  useEffect(() => { if (post) setUserVote(post.userVote ?? 0) }, [post])

  const { addToast } = useToast()

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post(`/posts/${id}/comments`, { content: comment })
      setComment('')
      addToast({ type: 'success', message: 'Comment posted' })
      fetch()
    } catch (err: any) { console.error(err); addToast({ type: 'error', message: err?.response?.data?.error || 'Failed to post comment' }) }
  }

  const [userVote, setUserVote] = useState<number>(0)

  const vote = async (val: number) => {
    // optimistic
    const prevVote = userVote || 0
    let newVote = val
    let newScore = post.score
    if (prevVote === val) { newVote = 0; newScore = post.score - val }
    else if (prevVote === 0) { newScore = post.score + val }
    else { newScore = post.score + val * 2 }
    setPost({ ...post, score: newScore })
    setUserVote(newVote)

    try {
      const res = await api.post(`/posts/${id}/vote`, { value: val })
      setPost({ ...post, score: res.data.score })
      setUserVote(res.data.userVote)
    } catch (err) { console.error(err); fetch() }
  }

  if (!post) return <div className="p-4">Loading…</div>

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="p-4 bg-white rounded shadow-sm">
        <h2 className="font-semibold text-xl">{post.title}</h2>
        <div className="text-sm text-gray-700 mt-2">{post.content}</div>
        <div className="mt-3 text-sm text-gray-500">Score: {post.score}</div>
        <div className="mt-3 flex gap-2">
          <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={() => vote(1)}>Upvote</button>
          <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => vote(-1)}>Downvote</button>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold">Comments</h3>
        <form onSubmit={submitComment} className="mt-2">
          <textarea className="w-full border p-2" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment" />
          <div className="mt-2">
            <button className="px-3 py-1 bg-blue-600 text-white rounded">Comment</button>
          </div>
        </form>

        <div className="mt-4">
          {post.comments?.map((c: any) => <CommentNode key={c.id} comment={c} onVote={fetch} />)}
        </div>
      </div>
    </div>
  )
}
