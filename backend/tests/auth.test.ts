import request from 'supertest'
import app from '../src/index'
import { prisma } from '../src/prisma'

describe('Auth', () => {
  beforeAll(async () => {
    // ensure db is clean (delete dependent records first)
    await prisma.vote.deleteMany()
    await prisma.commentVote.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.post.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  test('register and login', async () => {
    const email = `test-${Date.now()}@example.com`
    const res = await request(app).post('/auth/register').send({ email, password: 'password' })
    expect(res.status).toBe(201)
    expect(res.body.token).toBeDefined()

    const login = await request(app).post('/auth/login').send({ email, password: 'password' })
    expect(login.status).toBe(200)
    expect(login.body.token).toBeDefined()
  })
})
