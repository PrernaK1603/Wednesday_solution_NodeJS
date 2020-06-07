var Sequelize = require("sequelize");
var dbConnection=require('../database-connect');

const cabs = dbConnection.define("cabs", {
    driver_name: Sequelize.STRING,
    cab_number:Sequelize.STRING,
    location:Sequelize.STRING,
    check_available: Sequelize.BOOLEAN,
    contact: Sequelize.STRING
});

module.exports=cabs;
  
