const express = require("express");
const app = express();
const port = 3004; // App running on Port 3004
const Database = require("better-sqlite3");
const db = new Database("./database.db", {});
var bodyParser = require("body-parser");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// functions

// check if key exist and update time
function check_key(Key){
    // check if key is in database
    console.log(Key);
    const check_key = db.prepare("SELECT * FROM Key WHERE Key = @Key");
    const check = check_key.get({Key});
    console.log(check);
    if(check != undefined){
        console.log(check)
        // check if key is not out time
        if(new Date() / 1 - check["time"] > 100000000){
            console.log(new Date() / 1 - check["time"] );
            // delete Key
            const delete_key = db.prepare("DELETE FROM Key WHERE Key = @Key");
            delete_key.run({Key});
            return false;
        }
        else{
            // set new time for key
            const update_key = db.prepare("UPDATE Key SET time = @Time WHERE Key = @Key");
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
    return get_player.get({Key})["User_FK"];
}

// check if spiel exist and if user has rights to access
function spielexist(spiel_id, Player){
  console.log(11);
  var wf;
const spielexist = db.prepare("SELECT Player_2, aktueller_player FROM Games WHERE (Player_2 = @Player OR Player_1 = @Player) AND Games_ID = @spiel_id");
var check_spiel = spielexist.run({Player, spiel_id});
if(check_spiel != undefined){
    wf =  true;
}
else{
  wf =  false;  
}
return wf
}

// generate API Key
const genAPIKey = () => {
  //create a base-36 string that contains 30 chars in a-z,0-9
  return [...Array(300)]
    .map((e) => ((Math.random() * 36) | 0).toString(36))
    .join("");
};

// starts the game and insert all data to database
function game_create(Player_1, public){
    const get_max = db.prepare("SELECT MAX(Games_ID) FROM Games");
    var game_id = get_max.get();
    game_id = parseInt(game_id["MAX(Games_ID)"]) + 1;
    game_id++;
    const insert_game = db.prepare("INSERT INTO GAMES (Player_1, aktueller_player, public) VALUES (@Player_1, true, @public)");
    insert_game.run({Player_1, public, game_id});
    return game_id;
}

function game_start(Player_1, Player_2, game_id){
    const insert = db.prepare("INSERT INTO Figuren (Games_ID, X, Y, Type, Player) VALUES (@game_id, @X, @Y, @type, @player) ");
    //White Pawns
    insert.run({game_id, X:1, Y:2, type:1, player:Player_1});
    insert.run({game_id, X:2, Y:2, type:1, player:Player_1});
    insert.run({game_id, X:3, Y:2, type:1, player:Player_1});
    insert.run({game_id, X:4, Y:2, type:1, player:Player_1});
    insert.run({game_id, X:5, Y:2, type:1, player:Player_1});
    insert.run({game_id, X:6, Y:2, type:1, player:Player_1});
    insert.run({game_id, X:7, Y:2, type:1, player:Player_1});
    insert.run({game_id, X:8, Y:2, type:1, player:Player_1});
    //White Towers
    insert.run({game_id, X:1, Y:1, type:2, player:Player_1});
    insert.run({game_id, X:8, Y:1, type:2, player:Player_1});
    //White Knights
    insert.run({game_id, X:2, Y:1, type:3, player:Player_1});
    insert.run({game_id, X:7, Y:1, type:3, player:Player_1});
    //White Bishops
    insert.run({game_id, X:3, Y:1, type:4, player:Player_1});
    insert.run({game_id, X:6, Y:1, type:4, player:Player_1});
    //White King
    insert.run({game_id, X:5, Y:1, type:5, player:Player_1});
    //White Queen
    insert.run({game_id, X:4, Y:1, type:6, player:Player_1});

    //Black Pawns
    insert.run({game_id, X:1, Y:7, type:1, player:Player_2});
    insert.run({game_id, X:2, Y:7, type:1, player:Player_2});
    insert.run({game_id, X:3, Y:7, type:1, player:Player_2});
    insert.run({game_id, X:4, Y:7, type:1, player:Player_2});
    insert.run({game_id, X:5, Y:7, type:1, player:Player_2});
    insert.run({game_id, X:6, Y:7, type:1, player:Player_2});
    insert.run({game_id, X:7, Y:7, type:1, player:Player_2});
    insert.run({game_id, X:8, Y:7, type:1, player:Player_2});
    //Black Towers
    insert.run({game_id, X:1, Y:8, type:2, player:Player_2});
    insert.run({game_id, X:8, Y:8, type:2, player:Player_2});
    //Black Knights
    insert.run({game_id, X:2, Y:8, type:3, player:Player_2});
    insert.run({game_id, X:7, Y:8, type:3, player:Player_2});
    //Black Bishops
    insert.run({game_id, X:3, Y:8, type:4, player:Player_2});
    insert.run({game_id, X:6, Y:8, type:4, player:Player_2});
    //Black King
    insert.run({game_id, X:5, Y:8, type:5, player:Player_2});
    //Black Queen
    insert.run({game_id, X:4, Y:8, type:6, player:Player_2});

}


/*
-------------------------------------------------------------------------------------------------------------------------------
Beginn of the main code 
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
*/
/*
Login
Needs name and Password.
Checks in Database if User and Password exists.
No = "wrong user or Password"
No connection = "wrong user or password"
Yes = sends api key
*/

app.post("/login", async function (req, res) {
  try {
    let { name, password } = req.body;
    const check_key = db.prepare(   
      "SELECT * FROM User WHERE Username= @name AND Password = @password"
    );
    const check = await check_key.get({ name, password });
    if (check != undefined) {
      let api_key = genAPIKey();
      var time = new Date() / 1;
      const user_ID = check["User_ID"];
      const insertKEY = db.prepare(
        "INSERT INTO Key (time, User_FK, Key) VALUES (@time, @user_ID, @Key)"
      );
      insertKEY.run({ time, user_ID, Key:api_key });

      res.send(api_key);
    } else {
      res.send("wrong user or password");
    }
  } catch (error) {
    console.log(error);
    res.send("wrong user or password");
  }
});
/*
Register Start
*/
app.post("/register", async function (req, res) {
  try {
    let { name, password } = req.body;
    const check_key = db.prepare("SELECT * FROM User WHERE Username= @name");
    const check = await check_key.get({ name });
    if (check === undefined && name.length >= 5 && name.length <= 200) {
      res.send("Account created");
      const insertUser = db.prepare(
        "INSERT INTO User (Username, Password) VALUES (@name, @password)"
      );
      insertUser.run({ name, password });
    } else if (name.length <= 5) {
      res.send("Username is too short!");
    } else if (name.length >= 200) {
      res.send("Username is to long!");
    } else {
      res.send("User already exists");
    }
  } catch (error) {
    console.log(error);
    res.send("Error");
  }
});
/*
Register END
*/

app.post("/create_game", async function (req, res) {
    try{
        let {KEY, public} = req.body;
        if(!(await check_key(KEY))) res.send("ungültiger KEY");
        else{
            var Player = await get_player(KEY);
            response = await game_create(Player, public);
            res.send(response.toString());
        }
    }
    catch(error){
        console.log(error);
        res.send("Error");
    }
})

app.post("/join_game", async function (req, res) {
    try{
        let {KEY, code} = req.body;
        console.log(KEY);
        if(!(await check_key(KEY))) res.send("ungültiger KEY");
        else{
            const check_code = db.prepare("SELECT * FROM Games WHERE Games_ID = @code");
            var check = check_code.get({code});
            if(check != undefined){
                var Player = await get_player(KEY);
            const join_game = db.prepare("UPDATE Games SET Player_2 = @Player WHERE Games_ID = @code");
            join_game.run({Player, code});
            const get_player1 = db.prepare("SELECT Player_1 FROM Games WHERE Games_ID = @code");
            player1 = get_player1.get({code});
            console.log("____________________________");
            console.log(player1);
            await game_start(player1["Player_1"], Player, code)
            res.send("Success");
            }
            else{
                res.send("Wrong Code");

            }
        }
    }
    catch(error){
        console.log(error);
        res.send("Error");
    }
});

app.post("/mache_move", async function (req, res) {
  try {
    let {KEY, spiel_id, anfangx, anfangy, endex, endey} = req.body;
    if(!(await check_key(KEY))) res.send("ungültiger KEY");
    var Player = get_player(KEY);
    if(!spielexist(spiel_id, Player)) res.send("ungültiges Spiel");
    const get_type = db.prepare("SELECT Type FROM Figuren WHERE Games_ID = @spiel_id AND X = @anfangx AND Y = @anfangy");
    var spielfigur = get_type.run({spiel_id ,anfangx, anfangy});
    const get_color = db.prepare("SELECT Player FROM Figuren WHERE Games_ID = @spiel_id AND X = @anfangx AND Y = @anfangy");
    console.log(spiel_id ,anfangx, anfangy);
    var g_color = get_color.get({ spiel_id ,anfangx, anfangy});
    var farbe // true = weiss false = schwarz
    if(g_color["Player"] === Player) farbe = true
    else if (g_color["Player"] === Player) farbe = false
    else res.send("Error");
    /*
    Switch for White Figures
    */
    if ((farbe = true)) {
      switch (spielfigur) {
      /*
      Pawn
      */
        case 1:
          if (anfangx - endex != -1) {
            spielzug = false; // Überprüfung ob der Bauer nach vorne geht
          }

          if (
            ((await getposition(anfangx + 1, anfangy + 1, spiel_id)) &&
              anfangx + 1 === endex &&
              anfangy + 1 === endey) ||
            ((await getposition(anfangx + 1, anfangy - 1, spiel_id)) &&
              anfangx + 1 === endex &&
              anfangy - 1 === endey)
          ) {
            spielzug = true;
            eat(endex, endey, spiel_id); // Überprüfung ob der Bauer essen will und kann
          }

          if (anfangx === 2 && !(await getposition(anfangx + 1))) {
            (await anfangy) + 2 || anfangy + 1; // Überprüfung ob der Bauer 2 Felder nach vorne gehen kann
          }

          if (await getposition(anfangx + 1, anfangy, spiel_id)) {
            spielzug = false;
          } // Überprüft ob eine Figur vor dem Bauer steht
          break;

        /*
        Rook
        */
        case 2:
          if (anfangx !== endex && anfangy !== endey) {
            spielzug = false;
          }
          if (anfangx === endex) {
            //Function checks if in the x axis is any piece
            let increment = (endey - anfangy) / Math.abs(endey - anfangy);
            for (let i = anfangy + increment; i !== endey; i += increment) {
              if (await getposition(anfangx, i, spiel_id)) {
                spielzug = true;
                eat(endex, endey, spiel_id);
                break;
              }
            }
          } else if (anfangy === endey) {
            //Function checks if in the y axis is any piece
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
        /*
        Knight
        */
        case 3:
          if (anfangx + 2 === endex && anfangy - 1 === endey) {
            eat(endex, endey, spiel_id);
            spielzug = true;
            break;
          }
          if (anfangx + 2 === endex && anfangy + 1 === endey) {
            eat(endex, endey, spiel_id);
            spielzug = true;
            break;
          }
          if (anfangx + 1 === endex && anfangy - 2 === endey) {
            eat(endex, endey, spiel_id);
            spielzug = true;
            spielzug = true;
            break;
          }
          if (anfangx + 1 === endex && anfangy + 2 === endey) {
            eat(endex, endey, spiel_id);
            spielzug = true;
            break;
          }
          if (anfangx - 1 === endex && anfangy + 2 === endey) {
            eat(endex, endey, spiel_id);
            spielzug = true;
            break;
          }
          if (anfangx - 1 === endex && anfangy - 2 === endey) {
            eat(endex, endey, spiel_id);
            spielzug = true;
            break;
          }
          if (anfangx - 2 === endex && anfangy + 1 === endey) {
            eat(endex, endey, spiel_id);
            spielzug = true;
            break;
          }
          if (anfangx - 2 === endex && anfangy - 1 === endey) {
            eat(endex, endey, spiel_id);
            spielzug = true;
            break;
          }
          spielzug = false;
          break;
        /*
        Bishop
        */
        case 4:
          if (Math.abs(endex - anfangx) != Math.abs(endey - anfangy)) {
            spielzug = false;
            break;
          }

          var increment
          if(anfangx-endex > 0) increment = -1
          else increment = 1
          let i = anfangx;
          let j = anfangy;

          while (i != endex && j != endey) {
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
        /*
        King
        */
        case 5:
          if (anfangx + 1 === endex && anfangy + 1 === endey) {
            eat(endex, endey, spiel_id);
            spielzug = true;
            break;
          }
          if (anfangx + 1 === endex && anfangy + 0 === endey) {
            eat(endex, endey, spiel_id);
            spielzug = true;
            break;
          }
          if (anfangx + 1 === endex && anfangy - 1 === endey) {
            eat(endex, endey, spiel_id);
            spielzug = true;
            break;
          }
          if (anfangx + 0 === endex && anfangy + 1 === endey) {
            eat(endex, endey, spiel_id);
            spielzug = true;
            break;
          }
          if (anfangx + 0 === endex && anfangy - 1 === endey) {
            eat(endex, endey, spiel_id);
            spielzug = true;
            break;
          }
          if (anfangx - 1 === endex && anfangy + 1 === endey) {
            eat(endex, endey, spiel_id);
            spielzug = true;
            break;
          }
          if (anfangx - 1 === endex && anfangy + 0 === endey) {
            eat(endex, endey, spiel_id);
            spielzug = true;
            break;
          }
          if (anfangx - 1 === endex && anfangy - 1 === endey) {
            eat(endex, endey, spiel_id);
            spielzug = true;
            break;
          }
          spielzug = false;
          break;
        /*
        Queen
        */
        case 6:
          if (anfangx === endex && anfangy === endey) {
            spielzug = false;
            break;
          }
          if (anfangx === endex || anfangy === endey) {
            if (anfangx === endex) {
              //Function checks if in the x axis is any piece
              let increment = (endey - anfangy) / Math.abs(endey - anfangy);
              for (let i = anfangy + increment; i !== endey; i += increment) {
                if (await getposition(anfangx, i, spiel_id)) {
                  spielzug = true;
                  eat(endex, endey, spiel_id);
                  break;
                }
              }
            }
          } else {
            var richtung;
            if (anfangx - endex > 0) richtung = true;
            else richtung = false;
            if (Math.abs(anfangx - endex) === Math.abs(anfangy - endey)) {
              for (let i = 1; i < Math.abs(anfangx - endex); i++) {
                if (
                  getposition(anfangx + i, anfangy + i, spiel_id) &&
                  !richtung
                ) {
                  spielzug = false;
                  break;
                }
                if (
                  getposition(anfangx - i, anfangy - i, spiel_id) &&
                  richtung
                ) {
                  spielzug = false;
                  break;
                }
              }
            } else {
              spielzug = false;
            }
          }
          break;
      }
    /*
    Switch for black figures
    */
    } else if (farbe == false) {
      switch (spielfigur) {
        /*
        Pawn
        */
        case 1:
          if (anfangx - endex != +1) {
            spielzug = false; // Überprüfung ob der Bauer nach vorne geht
          }

          if (
            ((await getposition(anfangx - 1, anfangy - 1, spiel_id)) &&
              anfangx - 1 === endex &&
              anfangy - 1 === endey) ||
            ((await getposition(anfangx - 1, anfangy + 1, spiel_id)) &&
              anfangx - 1 === endex &&
              anfangy + 1 === endey)
          ) {
            spielzug = true;
            eat(endex, endey, spiel_id); // Überprüfung ob der Bauer essen will und kann
          }

          if (anfangx === 2 && !(await getposition(anfangx - 1))) {
            (await anfangy) - 2 || anfangy - 1; // Überprüfung ob der Bauer 2 Felder nach vorne gehen kann
          }

          if (await getposition(anfangx + 1, anfangy, spiel_id)) {
            spielzug = false;
          } // Überprüft ob eine Figur vor dem Bauer steht
          break;
        /*
        Rook
        */
        case 2:
          if (anfangx !== endex && anfangy !== endey) {
            spielzug = false;
          }
          if (anfangx === endex) {
            //Function checks if in the x axis is any piece
            let increment = (endey - anfangy) / Math.abs(endey - anfangy);
            for (let i = anfangy + increment; i !== endey; i += increment) {
              if (await getposition(anfangx, i, spiel_id)) {
                spielzug = true;
                eat(endex, endey, spiel_id);
                break;
              }
            }
          } else if (anfangy === endey) {
            //Function checks if in the y axis is any piece
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
        /*
        Knight
        */
        case 3:
          if (anfangx + 2 === endex && anfangy - 1 === endey) {
            eat(endex, endey, spiel_id);
            break;
          }
          if (anfangx + 2 === endex && anfangy + 1 === endey) {
            eat(endex, endey, spiel_id);
            break;
          }
          if (anfangx + 1 === endex && anfangy - 2 === endey) {
            eat(endex, endey, spiel_id);
            break;
          }
          if (anfangx + 1 === endex && anfangy + 2 === endey) {
            eat(endex, endey, spiel_id);
            break;
          }
          if (anfangx - 1 === endex && anfangy + 2 === endey) {
            eat(endex, endey, spiel_id);
            break;
          }
          if (anfangx - 1 === endex && anfangy - 2 === endey) {
            eat(endex, endey, spiel_id);
            break;
          }
          if (anfangx - 2 === endex && anfangy + 1 === endey) {
            eat(endex, endey, spiel_id);
            break;
          }
          if (anfangx - 2 === endex && anfangy - 1 === endey) {
            eat(endex, endey, spiel_id);
            break;
          }
          spielzug = false;
          break;
        /*
        Bishop
        */
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
          /*
          King
          */
          break;
        case 5:
          if (anfangx + 1 === endex && anfangy + 1 === endey) {
            eat(endex, endey, spiel_id);
            break;
          }
          if (anfangx + 1 === endex && anfangy + 0 === endey) {
            eat(endex, endey, spiel_id);
            break;
          }
          if (anfangx + 1 === endex && anfangy - 1 === endey) {
            eat(endex, endey, spiel_id);
            break;
          }
          if (anfangx + 0 === endex && anfangy + 1 === endey) {
            eat(endex, endey, spiel_id);
            break;
          }
          if (anfangx + 0 === endex && anfangy - 1 === endey) {
            eat(endex, endey, spiel_id);
            break;
          }
          if (anfangx - 1 === endex && anfangy + 1 === endey) {
            eat(endex, endey, spiel_id);
            break;
          }
          if (anfangx - 1 === endex && anfangy + 0 === endey) {
            eat(endex, endey, spiel_id);
            break;
          }
          if (anfangx - 1 === endex && anfangy - 1 === endey) {
            eat(endex, endey, spiel_id);
            break;
          }
          spielzug = false;
          break;
        /*
        Queen
        */
        case 6:
          if (anfangx === endex && anfangy === endey) {
            spielzug = false;
            break;
          }
          if (anfangx === endex || anfangy === endey) {
            if (anfangx === endex) {
              //Function checks if in the x axis is any piece
              let increment = (endey - anfangy) / Math.abs(endey - anfangy);
              for (let i = anfangy + increment; i !== endey; i += increment) {
                if (await getposition(anfangx, i, spiel_id)) {
                  spielzug = true;
                  eat(endex, endey, spiel_id);
                  break;
                }
              }
            }
          } else {
            var richtung;
            if (anfangx - endex > 0) richtung = true;
            else richtung = false;
            if (Math.abs(anfangx - endex) === Math.abs(anfangy - endey)) {
              for (let i = 1; i < Math.abs(anfangx - endex); i++) {
                if (
                  getposition(anfangx + i, anfangy + i, spiel_id) &&
                  !richtung
                ) {
                  spielzug = false;
                  break;
                }
                if (
                  getposition(anfangx - i, anfangy - i, spiel_id) &&
                  richtung
                ) {
                  spielzug = false;
                  break;
                }
              }
            } else {
              spielzug = false;
            }
          }
          break;
      }
      // does the moving and the eating
      await eat(endex, endey, spiel_id);
      const move = db.prepare("UPDATE Figuren SET X = @endex, Y =  @endey WHERE X = @anfangx AND Y = @anfangy AND Games_ID = @spiel_id");
      if(spielzug === true){
        move.run({endex, endey, anfangx, anfangy, spiel_id});
        res.send("Success");
      }
      else{
        res.send("ungültiger Zug");
      }
    }
  } catch (error) {
    console.log(error);
    res.send("Error");
  }
});

function getposition(x, y, spiel_id) {
  const check_position = db.prepare("SELECT * FROM Figuren WHERE X = x AND Y = y AND Games_ID = spiel_id");
  const check = check_position.get({x, y, spiel_id});
  console.log(check);
  if(check != undefined) return false;
  else return true;
}

function eat(x,y,id){
  new Promise(function(myResolve) {
    const deleten = db.prepare("DELETE FROM Figuren WHERE X = @x AND Y = @y AND Games_ID = @id");
    const check = deleten.run({x,y,id});  
    myResolve();
    });
  
}


app.get('/leaderboard', (req, res) => {
  const lead_list = db.prepare("SELECT Username, Wins FROM User ORDER BY Wins DESC LIMIT 10");
  var result = lead_list.all();
  res.send(result);
});

app.get('/your_live_games', (req, res) => {
  const lead_list = db.prepare("SELECT * FROM Games WHERE Player_1 = @;");
  var result = lead_list.all();
  res.send(result);
});

app.get('/all_live_games', (req, res) => {
  const lead_list = db.prepare("SELECT Username, Wins FROM User ORDER BY Wins DESC LIMIT 10");
  var result = lead_list.all();
  res.send(result);
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
