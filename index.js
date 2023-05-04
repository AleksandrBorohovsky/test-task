require('dotenv').config()
const express = require('express')
const path = require('path')

const sequelize = require('./db')
const router = require('./router/userRouter')

const PORT = process.env.PORT || 5000

const app = express()

app.use(express.json())
app.use(router)
app.use(express.static(path.resolve(__dirname,'static')))

const start = async () => {
    try{
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, ()=>{
            console.log(`Server started on port ${PORT}`)
        })
    } catch(e){
        console.log(e)
    }
}

start()