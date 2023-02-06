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

app.post('/mache_move', async function (req, res) {
try{
    let {KEY, spiel_id, anfangx, anfangy, endex, endey} = req.body;
    const get_type = db.prepare("SELECT Type FROM Figuren WHERE Player = ");
    get_type.run({anfangx, anfangy})
    var spielzug = true;
    var farbe = true; // true = weiss false = schwarz
    var spielfigur = 2;
    if(farbe = true){
        switch (spielfigur) {
            case 1: 
            
            if (anfangx-endex != -1) {
              spielzug = false; // Überprüfung ob der Bauer nach vorne geht
            }

            if((await getposition(anfangx+1, anfangy+1, spiel_id) && anfangx+1 === endex && anfangy+1 === endey)|| 
            await getposition(anfangx+1, anfangy-1, spiel_id) && anfangx+1 === endex && anfangy-1 === endey){
              spielzug = true;
              eat(endex, endey, spiel_id);  // Überprüfung ob der Bauer essen will und kann
            }

            if (anfangx === 2 && !(await getposition(anfangx + 1))) {
              await anfangy + 2 || anfangy + 1; // Überprüfung ob der Bauer 2 Felder nach vorne gehen kann
            }

            if (await getposition(anfangx+1, anfangy, spiel_id)) {
              spielzug = false;
            } // Überprüft ob eine Figur vor dem Bauer steht
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
    res.send()
}
})

function getposition(x,y,spiel_id){

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