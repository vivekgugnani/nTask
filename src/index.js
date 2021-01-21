const express = require('express')
require('./db/mongoose')
const userRouter = require('./routes/user')
const taskRouter = require('./routes/task')

const app = express()
const port = process.env.PORT

// app.use((req, res, next)=>{

//     res.status(503).send('The Server is Under Maintainance. Please try again later')
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

const multer = require('multer')

const upload = multer({
    dest: "images",
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(doc|docx)$/)){
           return  cb(new Error('Please Upload a Word Document!'))
        }
        cb(undefined, true)
    }

})

app.post('/upload', upload.single('upload'), (req, res) => {
    res.send()
},(error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

// const User = require('./models/user')
// const main = async () =>{
//     const user = await User.findById('600043934fe5ad3734fbe825')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
// }
// main()