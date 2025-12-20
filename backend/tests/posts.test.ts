import request from 'supertest'
import app from '../src/index'
import { prisma } from '../src/prisma'

let token: string

describe('Posts', () => {
  beforeAll(async () => {
    await prisma.vote.deleteMany()
    await prisma.commentVote.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.post.deleteMany()
    await prisma.user.deleteMany()
    const res = await request(app).post('/auth/register').send({ email: `post-${Date.now()}@example.com`, password: 'password' })
    token = res.body.token
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  test('create post and vote', async () => {
    const create = await request(app).post('/posts').set('Authorization', `Bearer ${token}`).send({ title: 'Hello', content: 'World' })
    expect(create.status).toBe(201)
    const postId = create.body.id

    const vote1 = await request(app).post(`/posts/${postId}/vote`).set('Authorization', `Bearer ${token}`).send({ value: 1 })
    expect(vote1.status).toBe(200)
    expect(vote1.body.score).toBe(1)
    expect(vote1.body.userVote).toBe(1)

    const voteToggle = await request(app).post(`/posts/${postId}/vote`).set('Authorization', `Bearer ${token}`).send({ value: 1 })
    expect(voteToggle.status).toBe(200)
    expect(voteToggle.body.score).toBe(0)
    expect(voteToggle.body.userVote).toBe(0)
  })
})