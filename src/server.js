const express = require("express");
const app = express();
const port = 3004;  // App running on Port 3004
const Database = require("better-sqlite3");
const db = new Database("./database.db", {});
const fs = require("fs");
var bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//Defines an API key.
const genAPIKey = () => {
    //create a base-36 string that contains 30 chars in a-z,0-9
    return [...Array(300)]
      .map((e) => ((Math.random() * 36) | 0).toString(36))
      .join("");
};
/*
Login
Needs name and Password.
Checks in Database if User and Password exists.
No = "wrong user or Password"
No connection = "wrong user or password"
Yes = sends api key
*/
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

/*
Register Start
*/
app.post('/register', async function (req, res){
    try{
        let {name, password} = req.body;
        const check_key = db.prepare("SELECT * FROM User WHERE Username= @name");
        const check = await check_key.get({name});
        if(check === undefined && name.length >= 5 && name.length <= 200){
                res.send("Account created");
               const insertUser = db.prepare("INSERT INTO User (Username, Password) VALUES (@name, @password)");
               insertUser.run({name, password })

        } else if(name.length <= 5) {
        res.send("Username is too short!")


        } else if(name.length >= 200) {
        res.send("Username is to long!")
        }
        else{
        res.send("User already exists");
        }
    }
    catch(error){
        console.log(error);
        res.send("Error");
    }
})
/*
Register END
*/


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
               
            if (anfangx !== endex && anfangy !== endey) {
                spielzug = false;
              }
              if (anfangx === endex) {  //Function checks if in the x axis is any piece
                let increment = (endey - anfangy) / Math.abs(endey - anfangy);
                for (let i = anfangy + increment; i !== endey; i += increment) {
                  if (await getposition(anfangx, i, spiel_id)) {
                    spielzug = true;
                    eat(endex, endey, spiel_id);
                    break;
                  }
                }
              } else if (anfangy === endey) {   //Function checks if in the y axis is any piece
                let increment = (endex - anfangx) / Math.abs(endex - anfangx);
                for (let i = anfangx + increment; i !== endex; i += increment) {
                  if (await getposition(i, anfangy, spiel_id)) {
                    spielzug = true;
                    eat(endex, endey, spiel_id);
                    break;
                  }
                }
              }

              break;
            case 3:
                if (anfangx + 2 === endex && anfangy-1 === endey) {
                  eat(endex, endey, spiel_id);
                  break;
                }
                if (anfangx + 2 === endex && anfangy+1 === endey) { 
                  eat(endex, endey, spiel_id);
                  break;
                }
                if (anfangx + 1 === endex && anfangy-2 === endey) {
                  eat(endex, endey, spiel_id);
                  break;
                }
                if (anfangx + 1 === endex && anfangy+2 === endey) {
                  eat(endex, endey, spiel_id);
                  break;
                }
                if (anfangx - 1 === endex && anfangy+2 === endey) {
                  eat(endex, endey, spiel_id);
                  break;
                }
                if (anfangx - 1 === endex && anfangy-2 === endey) {
                  eat(endex, endey, spiel_id);
                  break;
                }
                if (anfangx - 2 === endex && anfangy+1 === endey) {
                  eat(endex, endey, spiel_id);
                  break;
                }
                if (anfangx - 2 === endex && anfangy-1 === endey) {
                  eat(endex, endey, spiel_id);
                  break;
                }
                spielzug = false;
              break;

              case 4:
                if (Math.abs(endex - anfangx) !== Math.abs(endey - anfangy)) {
                spielzug = false;
                }

                let i = anfangx + incrementx;
                let j = anfangy + incrementy;

                while (i !== endex && j !== endey) {
                if (await getposition(i, j, spiel_id)) {
                    spielzug = false;
                    break;
                }
                i += incrementx;
                j += incrementy;
                }

                if (i === endex && j === endey) {
                spielzug = true;
                eat(endex, endey, spiel_id);
                }
                
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
              if (anfangx-endex != +1) {
                spielzug = false; // Überprüfung ob der Bauer nach vorne geht
              }
  
              if((await getposition(anfangx-1, anfangy-1, spiel_id) && anfangx-1 === endex && anfangy-1 === endey)|| 
              await getposition(anfangx-1, anfangy+1, spiel_id) && anfangx-1 === endex && anfangy+1 === endey){
                spielzug = true;
                eat(endex, endey, spiel_id);  // Überprüfung ob der Bauer essen will und kann
              }
  
              if (anfangx === 2 && !(await getposition(anfangx - 1))) {
                await anfangy - 2 || anfangy - 1; // Überprüfung ob der Bauer 2 Felder nach vorne gehen kann
              }
  
              if (await getposition(anfangx+1, anfangy, spiel_id)) {
                spielzug = false;
              } // Überprüft ob eine Figur vor dem Bauer steht
                break;
              break;
            case 2:
            
            if (anfangx !== endex && anfangy !== endey) {
                spielzug = false;
              }
              if (anfangx === endex) {  //Function checks if in the x axis is any piece
                let increment = (endey - anfangy) / Math.abs(endey - anfangy);
                for (let i = anfangy + increment; i !== endey; i += increment) {
                  if (await getposition(anfangx, i, spiel_id)) {
                    spielzug = true;
                    eat(endex, endey, spiel_id);
                    break;
                  }
                }
              } else if (anfangy === endey) {   //Function checks if in the y axis is any piece
                let increment = (endex - anfangx) / Math.abs(endex - anfangx);
                for (let i = anfangx + increment; i !== endex; i += increment) {
                  if (await getposition(i, anfangy, spiel_id)) {
                    spielzug = true;
                    eat(endex, endey, spiel_id);
                    break;
                  }
                }
              }

              break;
            case 3:
              if (anfangx + 2 === endex && anfangy-1 === endey) {
                eat(endex, endey, spiel_id);
                break;
              }
              if (anfangx + 2 === endex && anfangy+1 === endey) { 
                eat(endex, endey, spiel_id);
                break;
              }
              if (anfangx + 1 === endex && anfangy-2 === endey) {
                eat(endex, endey, spiel_id);
                break;
              }
              if (anfangx + 1 === endex && anfangy+2 === endey) {
                eat(endex, endey, spiel_id);
                break;
              }
              if (anfangx - 1 === endex && anfangy+2 === endey) {
                eat(endex, endey, spiel_id);
                break;
              }
              if (anfangx - 1 === endex && anfangy-2 === endey) {
                eat(endex, endey, spiel_id);
                break;
              }
              if (anfangx - 2 === endex && anfangy+1 === endey) {
                eat(endex, endey, spiel_id);
                break;
              }
              if (anfangx - 2 === endex && anfangy-1 === endey) {
                eat(endex, endey, spiel_id);
                break;
              }
              spielzug = false;
            break;
            case 4:
                
             if (anfangx !== endex && anfangy !== endey) {
                spielzug = false;
                }
                let incrementx = (endex - anfangx) / Math.abs(endex - anfangx);
                let incrementy = (endey - anfangy) / Math.abs(endey - anfangy);

                if (Math.abs(endex - anfangx) !== Math.abs(endey - anfangy)) {
                spielzug = false;
                }

                let i = anfangx + incrementx;
                let j = anfangy + incrementy;

                while (i !== endex && j !== endey) {
                if (await getposition(i, j, spiel_id)) {
                    spielzug = false;
                    break;
                }
                i += incrementx;
                j += incrementy;
                }

                if (i === endex && j === endey) {
                spielzug = true;
                eat(endex, endey, spiel_id);
                }
                
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


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });