require("dotenv").config();
var express = require("express");
var app = express();
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
var bodyParser = require("body-parser");
const { Op } = require("sequelize");
var ipInfo = require("ipinfo");
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
//var token = "0129d2c9ea8cfc";
//var ipinfo = new IPinfo(token);

var dbConnection = require("./database-connect");
var cabData = require("./cab_data");
var Booking = require("./model/booking");
var cabs = require("./model/cab");
var accessToken;

const limiter = rateLimit({
    windowMs: 1000, // 15 minutes
    max: 1, // limit each IP to 100 requests per windowMs
    message:"Our Server is busy give us a moment!"
});
  

// Swagger Info
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Wednesday Solution Node Challenge",
            description: "This solution server for the challenge.",
            termsOfService: "http://example.com/terms/",
            contact: {
                name: "API Support",
                url: "http://www.example.com/support",
                email: "support@example.com"
            },
            license: {
                name: "Apache 2.0",
                url: "https://www.apache.org/licenses/LICENSE-2.0.html"
            },
            version: "1.0.1"
        }
    },
    apis: ["index.js"]
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(limiter);

var currentLocation;

ipInfo(async (err, cLoc) => {
    console.log(err || cLoc);
    currentLocation=cLoc.city;
});


/** 
* @swagger
* /:
*  get: 
*     description: Use to test the REST API  
*     responses:
*         '200':
*             description: A successful response
*/
app.get("/", function (req, res) {  
  res.write(currentLocation);
  res.end();
});




/** 
* @swagger
* /login:
*  post: 
*     description: Use to login 
*     parameters:
*         - name: email
*           in: body
*           schema:
*              type: object
*              properties:
*                  email:
*                      type: string  
*     responses:
*         '200':
*             description: A successful response
*/
app.post('/login',function(req,res){
    console.log(req.body.email);
    var email=req.body.email;
    console.log(email);
    var user = { email: email };
    accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    res.json({ accessToken: accessToken });
})




/** 
* @swagger
* /book/{drop}:
*  post: 
*     description: Use to request all users
*     parameters:
*         - name: drop
*           type: string
*           in: path
*           required: true    
*     responses:
*         '200':
*             description: A successful response
*/
app.post("/book/:drop",authenticateToken, function (req, res) {
  cabs
    .findOne({
      where: {
        [Op.and]: [{ location: currentLocation }, { check_available: true }],
      },
    })
    .then((data) => {
      console.log(req.user);
      Booking.create({
        name: req.user.email,
        source: currentLocation,
        destination: req.params.drop,
        cab_number: data.cab_number,
      })
        .then((data) => {
          res.json({
            status: 201,
            message:
              "Your Cab is Booked and you cab number is " + data.cab_number,
          });
        })
        .catch((error) => {
          res.json({
            status: 404,
            message: "Data not inserted in booking table",
          });
        });
    })
    .catch((error) => {
      res.json({
        status: 404,
        message: "Cab is not available near by you",
      });
    });
});

function authenticateToken(req, res, next) {
  //const authHeader = req.headers["authorization"];
  //const token = authHeader && authHeader.split(" ")[1];
  const authHeader=accessToken;
  const token=authHeader;
  if (token == null) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
    if (error) return res.sendStatus(403)
    req.user=user
    next()
  });
}




/** 
* @swagger
* /past_booking:
*  get: 
*     description: Used to view all the past bookings  
*     responses:
*         '200':
*             description: A successful response
*/
app.get("/past_booking",authenticateToken, function (req, res) {
  Booking.findAll({
    where: { name: req.user.email },
  })
    .then((data) => {
      res.json({
        status: 200,
        message: data,
      });
    })
    .catch((error) => {
      res.json({
        status: 404,
        message: "No Past Booking Found",
      });
    });
});




/** 
* @swagger
* /near_cabs:
*  get: 
*     description: Used to view all nearby cabs 
*     parameters:
*       - in: query
*         name: page
*         schema:
*           type: integer
*         description: Page Number
*       - in: query
*         name: limit
*         schema:
*           type: integer
*         description: The numbers of objects in one page  
*     responses:
*         '200':
*             description: A successful response
*/
app.get("/near_cabs",authenticateToken, function (req, res) {
    const page=parseInt(req.query.page);
    const limit=parseInt(req.query.limit);
    const startIndex=(page-1)*limit;
    const endIndex=page*limit;
  cabs
    .findAll({
      where: { location: currentLocation },
    })
    .then((data) => {
        const result={};
        if(endIndex<data.length)
        {
            result.next={
                page:page+1,
                limit:limit
            }
        }
        if(startIndex>0)
        {
            result.previous={
                page:page-1,
                limit:limit
            }
        }
        result.result=data.slice(startIndex,endIndex);
      res.json({
        status: 200,
        message: result
      });
    })
    .catch((error) => {
      res.json({
        status: 404,
        message: "There is no cab available near by your location",
      });
    });
});

// app.post("/cab_info", function (req, res) {
//   cabs
//     .bulkCreate(cabData)
//     .then((data) => {
//       res.json({
//         status: 201,
//         message: "data inserted",
//       });
//     })
//     .catch((error) => {
//       res.json({
//         status: 404,
//         message: error,
//       });
//     });
// });

app.listen(3000, function () {
  console.log("server started");
});
