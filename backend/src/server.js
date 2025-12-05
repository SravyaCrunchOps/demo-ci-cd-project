import dotenv from 'dotenv'
import mongoose from 'mongoose'
import app from './app.js'

dotenv.config()

const PORT = process.env.PORT || 4000
const MONGO_URI = process.env.MONGO_URI

console.log(MONGO_URI)

if(!MONGO_URI) {
    console.error('missing mongodb-url')
    process.exit(1)
}

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('connected to mongodb')
        app.listen(PORT, () => console.log(`API running on PORT: ${PORT}}`))
    })
    .catch((err) => {
        console.error('MongoDB connection error: ', err)
        process.exit(1)
    })
