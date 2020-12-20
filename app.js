//jshint esversion:6

require('dotenv').config();
const expressPkg = require('express');
const bodyParserPkg = require('body-parser');
const ejsPkg = require('ejs');
const mongoosePkg = require('mongoose'); // mongoose package is being used to connect to our mongoDB database
const encryptPkg = require('mongoose-encryption');

const app = expressPkg();

console.log(process.env.API_KEY);


// Here we created a new database called 'userDB' . Here we connected to our mongoDB database
mongoosePkg.connect("mongodb://localhost:27017/secretDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(bodyParserPkg.urlencoded({
  extended: true
}));
app.use(expressPkg.static("public"));
app.set('view engine', 'ejs');

// Mongoose schema
const secretSchema = new mongoosePkg.Schema ({
  email : String,
  password : String
});

// const secret = "little secret";  // This secret is used to encrypt our database. This is commented out as it is been used inside our .env file
secretSchema.plugin(encryptPkg, {secret: process.env.SECRET , encryptedFields: ["password"]}); // Here our schema has encryption power enabled & this will encrypt our entire database

// mongoose model. And here the collection name is 'secret'
const secretModel = new mongoosePkg.model("Secret" , secretSchema);


app.get("/" , function(req, res){
  res.render("home")     // This is going to render the home.ejs page
});

app.get("/login" , function(req, res){
  res.render("login")  // This is going to render the login.ejs page
});

app.get("/register" , function(req, res){
  res.render("register")  // This is going to render the register.ejs page
});

app.post("/register" , function(req, res){
  const newUser = new secretModel({ // Here we are able to grab the username & password of our new user from our register page
    email: req.body.username,
    password: req.body.password
  });

  newUser.save(function(err){
    if(err){
      console.log(err);
    } else {
      res.render("secrets");   // This will render our secrets.ejs page
    }
  });
});


// In this we are going to check in our database that we actually have a user with the credentials that they put in
app.post("/login" , function(req, res){
  const userName = req.body.username;
  const passWord = req.body.password;

  secretModel.findOne({email: userName}, function(err, foundUser){  // Here we are searching over our 'Secret' collection
    if(err){
      console.log(err);
    } else {
      if(foundUser) {
        if(foundUser.password === passWord) {  // Here we are checking is the password that the user typed in is same that is stored in our database
          res.render("secrets");
        }
      }
    }
  });
});








app.listen(3000, function() {
  console.log("Server started on port 3000");
});
