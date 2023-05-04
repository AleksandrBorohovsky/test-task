const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING, unique: true},
    firstName: {type: DataTypes.STRING},
    lastName: {type: DataTypes.STRING},
    img: {type: DataTypes.STRING(1000, {binary : true}), defaultValue: ''},
    pdf: {type: DataTypes.BLOB, defaultValue: false},
})

module.exports = User