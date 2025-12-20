import { Router } from 'express';
import { prisma } from '../prisma';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

// Create a post
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { title, content } = req.body;
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (!title) return res.status(400).json({ error: 'title required' });
  const post = await prisma.post.create({ data: { title, content, authorId: req.user.id } });
  res.status(201).json(post);
});

// Create a comment under a post (supports nested via parentId)
router.post('/:id/comments', authMiddleware, async (req: AuthRequest, res) => {
  const postId = Number(req.params.id);
  const { content, parentId } = req.body;
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (!content) return res.status(400).json({ error: 'content required' });
  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } });
    if (!parent || parent.postId !== postId) return res.status(400).json({ error: 'Invalid parent' });
  }
  const comment = await prisma.comment.create({ data: { content, postId, parentId, authorId: req.user.id } });
  res.status(201).json(comment);
});

// List posts with simple pagination and vote score (optional auth to include userVote)
import { optionalAuth } from '../middleware/optionalAuth';

router.get('/', optionalAuth, async (req: any, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const skip = (page - 1) * limit;

  const posts = await prisma.post.findMany({
    take: limit,
    skip,
    orderBy: { createdAt: 'desc' },
    include: { author: true, comments: true, votes: true },
  });

  const result = posts.map((p) => {
    const score = p.votes.reduce((s, v) => s + v.value, 0);
    const userVote = req.user ? (p.votes.find((v) => v.authorId === req.user.id)?.value ?? 0) : 0;
    return {
      id: p.id,
      title: p.title,
      content: p.content,
      author: p.author,
      createdAt: p.createdAt,
      score,
      userVote,
      commentsCount: p.comments.length,
    };
  });

  res.json(result);
});

// Get single post with nested comments (optional auth to include userVote info)
router.get('/:id', optionalAuth, async (req: any, res) => {
  const id = Number(req.params.id);
  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: true, votes: true },
  });
  if (!post) return res.status(404).json({ error: 'Not found' });

  const comments = await prisma.comment.findMany({ where: { postId: id }, include: { author: true, votes: true }, orderBy: { createdAt: 'asc' } });

  // build nested tree with scores and userVote
  const map = new Map<number, any>();
  comments.forEach((c) => {
    const score = c.votes.reduce((s, v) => s + v.value, 0);
    const userVote = req.user ? (c.votes.find((v) => v.authorId === req.user.id)?.value ?? 0) : 0;
    map.set(c.id, { ...c, score, userVote, children: [] });
  });
  const roots: any[] = [];
  map.forEach((c) => {
    if (c.parentId) {
      const parent = map.get(c.parentId);
      if (parent) parent.children.push(c);
      else roots.push(c);
    } else roots.push(c);
  });

  const score = post.votes.reduce((s, v) => s + v.value, 0);
  const userVote = req.user ? (post.votes.find((v) => v.authorId === req.user.id)?.value ?? 0) : 0;

  res.json({ id: post.id, title: post.title, content: post.content, author: post.author, createdAt: post.createdAt, score, userVote, comments: roots });
});

// Vote on post
router.post('/:id/vote', authMiddleware, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { value } = req.body; // 1 or -1
  if (![1, -1].includes(value)) return res.status(400).json({ error: 'value must be 1 or -1' });
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  let existing = await prisma.vote.findUnique({ where: { authorId_postId: { authorId: req.user.id, postId: id } } });
  if (!existing) {
    await prisma.vote.create({ data: { value, authorId: req.user.id, postId: id } });
  } else if (existing.value === value) {
    // toggle off
    await prisma.vote.delete({ where: { id: existing.id } });
  } else {
    await prisma.vote.update({ where: { id: existing.id }, data: { value } });
  }

  existing = await prisma.vote.findUnique({ where: { authorId_postId: { authorId: req.user.id, postId: id } } });
  const votes = await prisma.vote.findMany({ where: { postId: id } });
  const score = votes.reduce((s, v) => s + v.value, 0);
  const userVote = existing ? existing.value : 0;
  res.json({ score, userVote });
});

export default router;