var Sequelize = require("sequelize");
var dbConnection=require('../database-connect');

const bookings = dbConnection.define("bookings", {
    name: Sequelize.STRING,
    source:Sequelize.STRING,
    destination: Sequelize.STRING,
    cab_number:Sequelize.STRING
});

module.exports=bookings;
  
