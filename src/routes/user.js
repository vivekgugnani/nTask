const express = require('express');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
const upload = require('../middleware/avatar')
const {welcomeEmail, cancellationEmail} = require('../emails/accounts')
const router = express.Router()


router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    
    try {
        await user.save()
        welcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }
    
})

router.get('/users/me', auth ,async (req, res)=>{
   res.send(req.user)
})


router.patch('/users/me',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidUpdate = updates.every((update)=> allowedUpdates.includes(update)
    )

    if(!isValidUpdate){
        return res.status(400).send({error: "Invalid user Update"})
    }
    try {
        updates.forEach((update) =>  req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user) 
    } catch (error) {
       res.status(400).send() 
    }
    
})

router.delete('/users/me', auth ,async (req, res) => {
    try{
       await req.user.remove()
       cancellationEmail(req.user.email, req.user.name)
       res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
         res.send()
    } catch (error) {
        res.status(500).send()
    }
}) 

router.post('/users/logoutAll', auth, async (req, res) => {
    
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})


router.post('/users/me/avatar',auth,upload.single('avatar') , async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    
    req.user.avatars = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatars) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatars)
    } catch(e) {
        res.status(404).send( {error: e} )
    }
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        if(!req.user.avatars) {
            return res.status(400).send()
        }
        req.user.avatars = undefined
        await req.user.save()
        res.send() 
    } catch (error) {
        res.status(500).send()   
    }
})

module.exports = router