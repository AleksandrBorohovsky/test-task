const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
    if(req.method === 'OPTIONS'){
        next()
    }
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        if(!token){
            return res.status(401).json({message: 'Не авторизован'})
        }
        const decoder = jwt.verify(token, process.env.SECRET_KEY)  //проверка валидности токена
        req.user = decoder
        next()
    } catch(e) {
        res.status(401).json({message: 'Не авторизован'})
    }
}