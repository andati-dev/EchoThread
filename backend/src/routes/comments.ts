import { Router } from 'express';
import { prisma } from '../prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Vote on a comment
router.post('/:id/vote', authMiddleware, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { value } = req.body;
  if (![1, -1].includes(value)) return res.status(400).json({ error: 'value must be 1 or -1' });
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  let existing = await prisma.commentVote.findUnique({ where: { authorId_commentId: { authorId: req.user.id, commentId: id } } });
  if (!existing) {
    await prisma.commentVote.create({ data: { value, authorId: req.user.id, commentId: id } });
  } else if (existing.value === value) {
    await prisma.commentVote.delete({ where: { id: existing.id } });
  } else {
    await prisma.commentVote.update({ where: { id: existing.id }, data: { value } });
  }

  existing = await prisma.commentVote.findUnique({ where: { authorId_commentId: { authorId: req.user.id, commentId: id } } });
  const votes = await prisma.commentVote.findMany({ where: { commentId: id } });
  const score = votes.reduce((s, v) => s + v.value, 0);
  const userVote = existing ? existing.value : 0;
  res.json({ score, userVote });
});

export default router;