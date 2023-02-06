const express = require("express");
const app = express();
const port = 3004;
const Database = require("better-sqlite3");
const db = new Database("./database.db", {});
const fs = require("fs");
var bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));


const genAPIKey = () => {
    //create a base-36 string that contains 30 chars in a-z,0-9
    return [...Array(300)]
      .map((e) => ((Math.random() * 36) | 0).toString(36))
      .join("");
};

app.post('/login', async function (req, res) {
    try{
        let {name, password} = req.body;
        const check_key = db.prepare("SELECT * FROM User WHERE Username= @name AND Password = @password");
        const check = await check_key.get({name, password});
        if(check != undefined){
            let api_key = genAPIKey();
            var time = new Date() / 1;
            const user_ID = check["User_ID"];
            const insertKEY = db.prepare("INSERT INTO Key (time, User_FK) VALUES (@time, @user_ID)");
            insertKEY.run({time, user_ID })
            res.send(api_key);
        }
        else{
            res.send("wrong user or password");
        }
    }
    catch(error){
        console.log(error);
        res.send("wrong user or password");
    }
})

app.post('/register', async function (req, res){
    try{
        let {name, password} = req.body;
        const check_key = db.prepare("SELECT * FROM User WHERE Username= @name");
        const check = await check_key.get({name});
        if(check != undefined){
            
        }
        else{
            res.send("User already exist");
        }
    }
    catch(error){
        res.send("Error");
    }
})



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });