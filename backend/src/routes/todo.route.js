import { Router } from 'express'
import Todo from '../models/Todo.js'

const route = Router()

route.get('/', async(req, res) => {
    const todos = await Todo.find().sort({ createdAt: -1 })
    res.json(todos)
})

route.post('/', async(req, res) => {
    const { title } = req.body
    if(!title) {
        return res.status(404).json({error: 'Title is required.'})
    }
    const todo = await Todo.create({ title })
    res.status(201).json(todo)
}) 

route.patch('/:id/toggle', async(req, res) => {
    const { id } = req.params
    const todo = await Todo.findById(id)
    if(!todo) {
        res.status(404).json({error: 'Not found.'})
    }
    todo.completed = !todo.completed
    await todo.save()
    res.json(todo)
})

route.delete('/:id/delete', async(req, res) => {
    const {id} = req.params
    const todo = await Todo.findByIdAndDelete(id)
    if(!todo) {
        return res.status(404).json({error: 'Not found.'})
    }
    res.json({ok: true})
})

export default route