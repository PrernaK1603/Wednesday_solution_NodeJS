var Sequelize = require("sequelize");
const connection = new Sequelize("user", "root", "prerna123", {
    dialect: "mysql",
});

connection
  .sync({
    logging: console.log,
    force: false,
  })
  .then(() => {
    console.log("Connection to database is success");   
  })
  .catch((err) => {
    console.error("Unable to connect to database...");
  });


module.exports=connection;