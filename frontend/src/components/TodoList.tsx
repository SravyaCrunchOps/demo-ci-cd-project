import React, { useEffect, useState } from 'react'
import type { Todo } from '../types/todo'

export const TodoList = () => {
    const [title, setTitle] = useState('')
    const [todos, setTodos] = useState<Todo[]>([])
    const [loading, setLoading] = useState(false)

    async function load() {
        setLoading(true)
        const res = await fetch('/api/todos')
        const data = await res.json()
        setTodos(data)
        setLoading(false)
    }

    useEffect(() => {
        (async () => {
            await load()
        })()
    },[])

    async function handleForm(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if(!title) {
            console.log('no title')
            return
        }      
        const res = await fetch('/api/todos', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ title })
        }) 
        if(res.ok) {
            setTitle('')
            load()
        }                                                                                                                                                                                                                                                                                                                                                                    
    }

    const toggle = async(id: string) => {
        const res = await fetch(`/api/todos/${id}/toggle`, {
            method: 'PATCH',
        })
        if(res.ok) {
            load()
        }
    }

    const remove = async(id: string) => {
        const res = await fetch(`/api/todos/${id}/delete`, {method: 'DELETE'})
        if(res.ok) {
            load()
        }
    }

  return (
    <div className='todo-container'>
        <form onSubmit={handleForm}>
            <input 
                type='text'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Add a todo...'
            />
            <button type='submit'>Add</button>
        </form>    

        {loading ? <p>Loading...</p>: (
            <ul>
                {todos.map(todo => (
                    <li key={todo._id}>
                        <input
                            className='checkbox'
                            type='checkbox'
                            checked={todo.completed}
                            onChange={() => toggle(todo._id)}
                        />
                        <span className='title' style={{ textDecoration: todo.completed ? 'line-through': 'none' }}>
                            {todo.title}
                        </span>
                        <button onClick={() => remove(todo._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        )}
    </div>
  )
}
