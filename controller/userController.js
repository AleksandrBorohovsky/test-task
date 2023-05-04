const jwt = require('jsonwebtoken')
const PdfDocument = require('pdfkit')
const fs = require('fs')

const ApiError = require('../error/ApiError')
const User = require('../models/userModel')

const generateJwt = (email, firstName, lastName) =>{
    return  jwt.sign(
        {email, firstName, lastName},
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
        )
}

const buildPdf = (email, firstName, lastName, img) =>{
    const doc = new PdfDocument()
    doc.pipe(fs.createWriteStream(`./pdf/${email}.pdf`));
    doc
        .fontSize(25)
        .text(`${firstName.toString()} ${lastName.toString()}`, 100, 100)
    
    doc.image(`./images/${img.split('\\')[1]}`, {
            fit: [250, 300],
            align: 'center',
            valign: 'center'
        });
    doc.end()
}


class UserController {
    async registration(req, res, next){
        const {email, firstName, lastName} = req.body
        if(!email || !firstName || !lastName){
            return next(ApiError.badRequest('Некорректные данные'))
        }
        const candidate = await User.findOne({where: {email}})
        if(candidate){
            return next(ApiError.badRequest('Пользователь с таким email уже существует'))
        }
        const user = await User.create({email, firstName, lastName})
        console.log(user)
        const token = generateJwt(user.email, user.firstName, user.lastName)
        console.log(token)
        return res.json({token})
    }

    async login(req, res, next){
        const {email} = req.body
        const user = await User.findOne({where: {email}})
        if(!user){
            return next(ApiError.internal('Пользователь не найден'))
        }
        const token = generateJwt(user.email, user.firstName, user.lastName)

        return res.json({token})
    }

    async info(req, res) {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        const user = await User.findOne({where: {email:decoded.email }})
        return res.json(user)
    }

    async update(req,res, next){
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        let user = await User.findOne({where: {email:decoded.email }})

        const updates = Object.keys(req.body)
        const allowToUpdate = ['firstName','lastName','email','pdf', 'img']
        const isValidOperation = updates.every( (update) => {return allowToUpdate.includes(update)})
        if(!isValidOperation){
            return next(ApiError.badRequest('Некорректные данные'))
        }
        try{
            updates.forEach((update)=>{ req.user[update] = req.body[update] })
            user[updates] = req.user[updates]
            await user.save()
            res.json(user)
        }catch(e){
            return console.log(e)
        }
    }
    
    async delete(req,res){
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        await User.destroy({where: {email:decoded.email }})
        res.json('Success')
    }

    async image(req,res){
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        let user = await User.findOne({where: {email:decoded.email }})
        user.img = req.file.path
        await user.save()
        return res.json(user)
    }

    async createPdf(req,res){       
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        let user = await User.findOne({where: {email:decoded.email }})
        buildPdf(user.email, user.firstName,user.lastName,user.img)
        if(res.status(200)){
        user.pdf = true
        await user.save()
        return res.json(true)
        }
        return res.json(false)
    }

    async allUsers(req,res){
        const users = await User.findAll()
        console.log(users)
        return res.json(users)
    }

}

module.exports = new UserController()