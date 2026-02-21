const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const assert = require('node:assert')
const helper = require('./test_helper')


const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('unique identifier property of the blog posts is named id', async () => {
  const response = await api.get('/api/blogs')

  response.body.forEach(blog => {
    assert(blog.id)
  })
})

test('adding a blog', async () => {
  const newBlog = {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  const titles = response.body.map(b => b.title)

  assert.strictEqual(helper.initialBlogs.length + 1, response.body.length)
  assert(titles.includes('Canonical string reduction'))
})

test('likes by default is 0', async () => {
  const newBlog = {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  const likes = response.body.map(b => b.likes)

  assert.strictEqual(helper.initialBlogs.length + 1, response.body.length)
  const value = 0
  assert(likes.includes(value))
})


test('title is missing', async () => {
  const newBlog = {
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const response = await api.get('/api/blogs')

  assert.strictEqual(helper.initialBlogs.length, response.body.length)
})

test('url is missing', async () => {
  const newBlog = {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    likes: 12,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const response = await api.get('/api/blogs')

  assert.strictEqual(helper.initialBlogs.length, response.body.length)
})

test('deletion of a blog', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

  const blogsAtEnd = await helper.blogsInDb()

  const ids = blogsAtEnd.map(b => b.id)
  assert(!ids.includes(blogToDelete.id))

  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
})

test('delete fails with statuscode 400 id is invalid', async () => {
  const invalidId = '5a3d5da59070081a82a3445'

  await api.delete(`/api/blogs/${invalidId}`).expect(400)
})

test('update a blog', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToUpdate = blogsAtStart[0]

  const updatedBlog = {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 8,
  }

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlog)
    .expect(200)

  const blogsAtEnd = await helper.blogsInDb()

  const likes = blogsAtEnd.map(b => b.likes)
  assert(likes.includes(updatedBlog.likes))

  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('update a non existing blog', async () => {
  const validNonexistingId = await helper.nonExistingId()

  const updatedBlog = {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 8,
  }

  await api
    .put(`/api/blogs/${validNonexistingId}`)
    .send(updatedBlog)
    .expect(404)
})

test('update fails with statuscode 400 id is invalid', async () => {
  const invalidId = '5a3d5da59070081a82a3445'

  const updatedBlog = {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 8,
  }

  await api
    .put(`/api/blogs/${invalidId}`)
    .send(updatedBlog)
    .expect(400)
})

after(async () => {
  await mongoose.connection.close()
})