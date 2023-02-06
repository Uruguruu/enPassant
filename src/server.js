const express = require("express");
const app = express();
const port = 3004;
const Database = require("better-sqlite3");
const db = new Database("./database.db", {});
const fs = require("fs");
var bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// functions

// check if key exist and update time
function check_key(Key){
    // check if key is in database
    const check_key = db.prepare("SELECT * FROM Key WHERE Key = @Key");
    const check = check_key.get({Key});
    if(check != undefined){
        // check if key is not out time
        if(new Date() / 1 - check["time"] > 10000){
            // delete Key
            const delete_key = db.prepare("DELETE FROM Key WHERE Key = @Key");
            delete_key.run({Key});
            return false;
        }
        else{
            // set new time for key
            const update_key = this.db.prepare("UPDATE Key SET time = @Time WHERE Key = @Key");
            var Time = new Date() / 1;
            return true;
        }

    }
    else{
        return false;
    }
}

// returns the User_ID from the Key
function get_player(Key){
    const get_player = db.prepare("SELECT User_FK FROM Key WHERE Key = @Key");
    return get_player.run({Key});
}

// check if spiel exist and if user has rights to access
function spielexist(spiel_id, Player){
const spielexist = db.prepare("SELECT Player_2, aktueller_player FROM Games WHERE (Player_2 = @Player OR Player_1 = @Player) AND Games_ID = @spiel_id");
const check_spiel = spielexist.run({Player, spiel_id});
if(check_spiel =! undefined){
    return true;
}
return false;
}


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
            const insertKEY = db.prepare("INSERT INTO Key (time, User_FK, Key) VALUES (@time, @user_ID, @api_key");
            insertKEY.run({time, user_ID,  api_key})
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

app.post('/mache_move', async function (req, res) {
try{
    let {KEY, spiel_id, anfangx, anfangy, endex, endey} = req.body;
    if(!(await check_key(key))) res.send("ungültiger KEY");
    var Player = get_player(key);
    if(!spielexist(spiel_id, Player)) res.send("ungültiges Spiel");
    const get_type = db.prepare("SELECT Type FROM Figuren WHERE Player = @Player AND Games_ID = @spiel_id");
    get_type.run({anfangx, anfangy})
    var farbe = true;
    var spielfigur = 2;
    if(farbe = true){
        switch (spielfigur) {
            case 1:
              break;
            case 2:
               day = "Tuesday";
              break;
            case 3:
              day = "Wednesday";
              break;
            case 4:
              day = "Thursday";
              break;
            case 5:
              day = "Friday";
              break;
            case 6:
              day = "Saturday";
          }

        }
    else if(farbe == false){
        switch (spielfigur) {
            case 1:
              break;
            case 2:
               day = "Tuesday";
              break;
            case 3:
              day = "Wednesday";
              break;
            case 4:
              day = "Thursday";
              break;
            case 5:
              day = "Friday";
              break;
            case 6:
              day = "Saturday";
          }
    }
}
catch(error){
    res.send("Error")
}
})

function getposition(x,y,spiel_id){

}
function eat(x,y,spiel_id){

}

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