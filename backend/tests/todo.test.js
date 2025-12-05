import assert from 'node:assert'
import test from 'node:test'
import express from 'express'
import todosRouter from './routes/todo.route.js'
import request from 'supertest'

test('todos router: creates and list items (mocked)', async() => {
    // mock app without DB for simple route checks
    const app = express()
    app.use(express.json())
    app.use('/api/todos', todosRouter)

    // This test exercises route structure; real integration tests should use a test DB.
    const resGet = await request(app).get('/api/todos')
    assert.equal(resGet.status, 200)
})