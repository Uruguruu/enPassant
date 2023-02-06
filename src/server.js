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
    var farbe = true;
    var spielfigur = 2;
    if(farbe = true){
        switch (spielfigur) {
            case 1: 
            
            if (anfangx-endex != -1) {
              spielzug = false;
            }
            if((await getposition(anfangx+1, anfangy+1, spiel_id) && anfangx+1 === endex && anfangy+1 === endey)|| await getposition(anfangx+1, anfangy-1, spiel_id)){
              spielzug = true;
              eat(endex, endey, spiel_id);
            }

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
              if((anfangx+1 === endex && anfangy+1 === endey)){
                  eat(endex, endey, spiel_id);
                  break;
              }
              if((anfangx+1 === endex && anfangy+0 === endey)){
                  eat(endex, endey, spiel_id);
                  break;
              }
              if((anfangx+1 === endex && anfangy-1 === endey)){
                  eat(endex, endey, spiel_id);
                  break;
              }
              if((anfangx+0 === endex && anfangy+1 === endey)){
                  eat(endex, endey, spiel_id);
                  break;
              }
              if((anfangx+0 === endex && anfangy-1 === endey)){
                  eat(endex, endey, spiel_id);
                  break;
              }
              if((anfangx-1 === endex && anfangy+1 === endey)){
                  eat(endex, endey, spiel_id);
                  break;
              }
              if((anfangx-1 === endex && anfangy+0 === endey)){
                  eat(endex, endey, spiel_id);
                  break;
              }
              if((anfangx-1 === endex && anfangy-1 === endey)){
                  eat(endex, endey, spiel_id);
                  break;
              }
              spielzug = false;
              break;
            case 6:
              if(anfangx === endex && anfangy === endey){
                spielzug = false;
              break;  
              }
              if(anfangx === endex || anfangy === endey){
                if (anfangx === endex) {  //Function checks if in the x axis is any piece
                  let increment = (endey - anfangy) / Math.abs(endey - anfangy);
                  for (let i = anfangy + increment; i !== endey; i += increment) {
                    if (await getposition(anfangx, i, spiel_id)) {
                      spielzug = true;
                      eat(endex, endey, spiel_id);
                      break;
                    }
                  }
                }
              }
              else{
                var richtung;
                if(anfangx-endex > 0) richtung = true;
                else richtung = false;
                if(Math.abs(anfangx - endex) === Math.abs(anfangy- endey)){
                  for (let i = 1; i < Math.abs(anfangx - endex) ; i++) {
                    if(getposition(anfangx + i, anfangy+i, spiel_id) && !richtung){
                      spielzug = false;
                      break;
                    }
                    if(getposition(anfangx -i, anfangy-i, spiel_id) && richtung){
                      spielzug = false;
                      break;
                    }
                  }
                }
                else{
                  spielzug = false;
                }
              }
              break;
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
              if((anfangx+1 === endex && anfangy+1 === endey)){
                eat(endex, endey, spiel_id);
                break;
            }
            if((anfangx+1 === endex && anfangy+0 === endey)){
                eat(endex, endey, spiel_id);
                break;
            }
            if((anfangx+1 === endex && anfangy-1 === endey)){
                eat(endex, endey, spiel_id);
                break;
            }
            if((anfangx+0 === endex && anfangy+1 === endey)){
                eat(endex, endey, spiel_id);
                break;
            }
            if((anfangx+0 === endex && anfangy-1 === endey)){
                eat(endex, endey, spiel_id);
                break;
            }
            if((anfangx-1 === endex && anfangy+1 === endey)){
                eat(endex, endey, spiel_id);
                break;
            }
            if((anfangx-1 === endex && anfangy+0 === endey)){
                eat(endex, endey, spiel_id);
                break;
            }
            if((anfangx-1 === endex && anfangy-1 === endey)){
                eat(endex, endey, spiel_id);
                break;
            }
            spielzug = false;
              break;
            case 6:
              if(anfangx === endex && anfangy === endey){
                spielzug = false;
              break;  
              }
              if(anfangx === endex || anfangy === endey){
                if (anfangx === endex) {  //Function checks if in the x axis is any piece
                  let increment = (endey - anfangy) / Math.abs(endey - anfangy);
                  for (let i = anfangy + increment; i !== endey; i += increment) {
                    if (await getposition(anfangx, i, spiel_id)) {
                      spielzug = true;
                      eat(endex, endey, spiel_id);
                      break;
                    }
                  }
                }
              }
              else{
                var richtung;
                if(anfangx-endex > 0) richtung = true;
                else richtung = false;
                if(Math.abs(anfangx - endex) === Math.abs(anfangy- endey)){
                  for (let i = 1; i < Math.abs(anfangx - endex) ; i++) {
                    if(getposition(anfangx + i, anfangy+i, spiel_id) && !richtung){
                      spielzug = false;
                      break;
                    }
                    if(getposition(anfangx -i, anfangy-i, spiel_id) && richtung){
                      spielzug = false;
                      break;
                    }
                  }
                }
                else{
                  spielzug = false;
                }
              }
              break;
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