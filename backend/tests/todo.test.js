import assert from 'node:assert'
import test from 'node:test'
import express from 'express'
import request from 'supertest'
import todosRouter from '../src/routes/todo.route.js'
import Todo from '../src/models/Todo.js'


Todo.find = () => ({
    sort: () => Promise.resolve([])
})

test("force fail", () => {
    let x = 
    expect(1).toBe(2)
})

test('todos router: list items (mocked)', async() => {
    const app = express()
    app.use(express.json())
    app.use('/api/todos', todosRouter)

    // This test exercises route structure; real integration tests should use a test DB.
    const resGet = await request(app).get('/api/todos')
    assert.equal(resGet.status, 200)
    assert.deepEqual(resGet.body, [])
})