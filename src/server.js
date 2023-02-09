const express = require("express");
const app = express();
const port = 3004; // App running on Port 3004
const Database = require("better-sqlite3");
const db = new Database("./database.db", {});
var bodyParser = require("body-parser");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
// functions

// check if key exist and update time
function check_key(Key){
    // check if key is in database
    const check_key = db.prepare("SELECT * FROM Key WHERE Key = @Key");
    const check = check_key.get({Key});
    if(check != undefined){
        // check if key is not out time
        console.log(new Date() / 1);
        console.log(check["time"]);
        console.log(new Date() / 1 - check["time"]);
        if(new Date() / 1 - check["time"] > 6000000){
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
function get_player(Key) {
  const get_player = db.prepare("SELECT User_FK FROM Key WHERE Key = @Key");
  return get_player.get({ Key })["User_FK"];
}


// check if spiel exist and if user has rights to access
function spielexist(spiel_id, Player){
  var wf;
  const spielexist = db.prepare("SELECT Player_2, aktueller_player FROM Games WHERE (Player_2 = @Player OR Player_1 = @Player) AND Games_ID = @spiel_id");
  var check_spiel = spielexist.get({Player, spiel_id});
  if(check_spiel != undefined){
    if(check_spiel["aktueller_player"] === 1 && check_spiel["Player_2"] === Player ){
      wf = true;
    }
    else if(check_spiel["aktueller_player"] === 0 && check_spiel["Player_2"] != Player){
      wf = true;
    }
    else{
      // falscher spieler
      wf =  "f_player";
    }
  }
  else{
    // falsches Spiel
    wf =  "k_spiel";  
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
    const insert_game = db.prepare("INSERT INTO GAMES (Player_1, aktueller_player, public) VALUES (@Player_1, false, @public)");
    insert_game.run({Player_1, public, game_id});
    return game_id -1;
}

function game_start(Player_1, Player_2, game_id) {
  const insert = db.prepare(
    "INSERT INTO Figuren (Games_ID, X, Y, Type, Player) VALUES (@game_id, @X, @Y, @type, @player) "
  );
  //White Pawns
  insert.run({ game_id, X: 1, Y: 2, type: 1, player: Player_1 });
  insert.run({ game_id, X: 2, Y: 2, type: 1, player: Player_1 });
  insert.run({ game_id, X: 3, Y: 2, type: 1, player: Player_1 });
  insert.run({ game_id, X: 4, Y: 2, type: 1, player: Player_1 });
  insert.run({ game_id, X: 5, Y: 2, type: 1, player: Player_1 });
  insert.run({ game_id, X: 6, Y: 2, type: 1, player: Player_1 });
  insert.run({ game_id, X: 7, Y: 2, type: 1, player: Player_1 });
  insert.run({ game_id, X: 8, Y: 2, type: 1, player: Player_1 });
  //White Towers
  insert.run({ game_id, X: 1, Y: 1, type: 2, player: Player_1 });
  insert.run({ game_id, X: 8, Y: 1, type: 2, player: Player_1 });
  //White Knights
  insert.run({ game_id, X: 2, Y: 1, type: 3, player: Player_1 });
  insert.run({ game_id, X: 7, Y: 1, type: 3, player: Player_1 });
  //White Bishops
  insert.run({ game_id, X: 3, Y: 1, type: 4, player: Player_1 });
  insert.run({ game_id, X: 6, Y: 1, type: 4, player: Player_1 });
  //White King
  insert.run({ game_id, X: 5, Y: 1, type: 5, player: Player_1 });
  //White Queen
  insert.run({ game_id, X: 4, Y: 1, type: 6, player: Player_1 });

  //Black Pawns
  insert.run({ game_id, X: 1, Y: 7, type: 1, player: Player_2 });
  insert.run({ game_id, X: 2, Y: 7, type: 1, player: Player_2 });
  insert.run({ game_id, X: 3, Y: 7, type: 1, player: Player_2 });
  insert.run({ game_id, X: 4, Y: 7, type: 1, player: Player_2 });
  insert.run({ game_id, X: 5, Y: 7, type: 1, player: Player_2 });
  insert.run({ game_id, X: 6, Y: 7, type: 1, player: Player_2 });
  insert.run({ game_id, X: 7, Y: 7, type: 1, player: Player_2 });
  insert.run({ game_id, X: 8, Y: 7, type: 1, player: Player_2 });
  //Black Towers
  insert.run({ game_id, X: 1, Y: 8, type: 2, player: Player_2 });
  insert.run({ game_id, X: 8, Y: 8, type: 2, player: Player_2 });
  //Black Knights
  insert.run({ game_id, X: 2, Y: 8, type: 3, player: Player_2 });
  insert.run({ game_id, X: 7, Y: 8, type: 3, player: Player_2 });
  //Black Bishops
  insert.run({ game_id, X: 3, Y: 8, type: 4, player: Player_2 });
  insert.run({ game_id, X: 6, Y: 8, type: 4, player: Player_2 });
  //Black King
  insert.run({ game_id, X: 5, Y: 8, type: 5, player: Player_2 });
  //Black Queen
  insert.run({ game_id, X: 4, Y: 8, type: 6, player: Player_2 });
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
No = "Invalid wrong user or Password"
No connection = "Invalid wrong user or password"
Yes = sends api key
*/

app.post("/login", async function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  try {
    console.log("login");
    let { name, password } = req.body;
    const check_key = db.prepare(
      "SELECT * FROM User WHERE Username= @name AND Password = @password"
    );
    console.log(name, password);
    const check = await check_key.get({ name, password });
    if (check != undefined) {
      let api_key = genAPIKey();
      var time = new Date() / 1;
      const user_ID = check["User_ID"];
      const insertKEY = db.prepare(
        "INSERT INTO Key (time, User_FK, Key) VALUES (@time, @user_ID, @Key)"
      );
      insertKEY.run({ time, user_ID, Key: api_key });

      res.send(api_key);
    } else
    {
      res.send("Invalid wrong user or password");
    }
  }
  catch (error)
  {
    console.log(error);
    res.send("Invalid wrong user or password");
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
      const insertUser = db.prepare(
        "INSERT INTO User (Username, Password) VALUES (@name, @password)"
      );
      insertUser.run({ name, password });
      res.send("Account created");
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
      if(!(await check_key(KEY))) res.send("Invalid KEY");
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
    if(!(await check_key(KEY))) res.send("Invalid KEY");
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
    anfangy = parseInt(anfangy);
    anfangx = parseInt(anfangx);
    endex = parseInt(endex);
    endey =parseInt(endey);
    spiel_id =parseInt(spiel_id);
    console.log(KEY, spiel_id, anfangx, anfangy, endex, endey);
    if(!(await check_key(KEY))) res.send("Invalid KEY");
    else{
      var Player = get_player(KEY);
      if(spielexist(spiel_id, Player) === "k_spiel" || spielexist(spiel_id, Player) === "f_player")
      { 
        res.send("Invalid Game doesn't exist " + spielexist(spiel_id, Player));
        return;
      }
      else{
        const get_type = db.prepare("SELECT Type FROM Figuren WHERE Games_ID = @spiel_id AND X = @anfangx AND Y = @anfangy");
        var spielfigur;
        try{
          spielfigur = get_type.get({spiel_id ,anfangx, anfangy})["Type"];
        }
        catch{
          res.send("Invalid Move (No figure found)");
          return;
        }
        const get_player = db.prepare("SELECT Player FROM Figuren WHERE Games_ID = @spiel_id AND X = @anfangx AND Y = @anfangy");
        try{
        var get_player_f = get_player.get({spiel_id ,anfangx, anfangy})["Player"]
        }
        catch{}
        if(!(get_player_f === Player)){
          res.send("Invalid Move (wrong player)");
          return;
        }
        else{
          const get_color = db.prepare("SELECT g.Player_2 FROM Figuren f LEFT JOIN Games g ON f.Player = g.Player_2 WHERE f.X = @anfangx AND f.Y = @anfangy AND f.Games_ID = @spiel_id");
          var g_color = get_color.get({anfangx, anfangy, spiel_id});
          console.log(g_color, Player);
          var farbe // true = weiss false = schwarz
          if(g_color["Player_2"] === Player) farbe = false;
          else farbe = true;
          var spielzug;
          // check if they arent the same and in the playground
          if(anfangx === endex && anfangy === endey){
            spielzug = false;
            res.send("Invalid Move (The coordinates are equal)");
          }
          if(anfangx < 1 || anfangx > 8|| anfangy < 1 || anfangy > 8|| endex < 1 || endex > 8|| endex < 1 || endex > 8){
            spielzug = false;
            res.send("Invalid Move (Coordinates are not on the field)");
          }
          /*
          Switch for White Figures
          */
          if ((farbe === true)) {
            switch (spielfigur) {
              /*
              Pawn
              */
            case 1:
              console.log(1);
              if (anfangy - endey != -1) {
                spielzug = false; // Überprüfung ob der Bauer nach vorne geht
              }
              if (
              ((await getposition(anfangx + 1, anfangy + 1, spiel_id)) &&
              anfangx + 1 === endex &&
              anfangy + 1 === endey) ||
              ((await getposition(anfangx - 1, anfangy + 1, spiel_id)) &&
              anfangx - 1 === endex &&
              anfangy + 1 === endey)
              )
              {
                spielzug = true;
                 // Überprüfung ob der Bauer essen will und kann
                break; 
              }
          
              if (anfangy === 2 && !(await getposition(anfangy + 1)) && anfangy - endey === -2) {
                spielzug = true;
                break; // Überprüfung ob der Bauer 2 Felder nach vorne gehen kann
              }
          
              if (await getposition(anfangx, anfangy + 1, spiel_id)) {
                spielzug = false;
                break;
              } // Überprüft ob eine Figur vor dem Bauer steht
              if (anfangx - endex != 0) {
                spielzug = false; // Überprüfung ob der Bauer nach vorne geht
              }
              console.log();
              if(spielzug != false) spielzug = true;
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
                if (!(await getposition(anfangx, i, spiel_id))) {
                  spielzug = false;
                  break;
                }
              }
              spielzug = true;
              } 
              else if (anfangy === endey) {
              //Function checks if in the y axis is any piece
              let increment = (endex - anfangx) / Math.abs(endex - anfangx);
              for (let i = anfangx + increment; i === endex; i += increment) {
                if (!(await getposition(i, anfangy, spiel_id))) {
                  spielzug = false;
                  break;
                }
              }
              spielzug = true;
              }
              break;
            /*
            Knight
            */
            case 3:
              if (anfangx + 2 === endex && anfangy - 1 === endey) {
                
                spielzug = true;
                break;
              }
              if (anfangx + 2 === endex && anfangy + 1 === endey) {
                
                spielzug = true;
                break;
              }
              if (anfangx + 1 === endex && anfangy - 2 === endey) {
                
                spielzug = true;
                break;
              }
              if (anfangx + 1 === endex && anfangy + 2 === endey) {
                
                spielzug = true;
                break;
              }
              if (anfangx - 1 === endex && anfangy + 2 === endey) {
                
                spielzug = true;
                break;
              }
              if (anfangx - 1 === endex && anfangy - 2 === endey) {
                
                spielzug = true;
                break;
              }
              if (anfangx - 2 === endex && anfangy + 1 === endey) {
                
                spielzug = true;
                break;
              }
              if (anfangx - 2 === endex && anfangy - 1 === endey) {
                
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
              var incrementx;
              var incrementy;
              if(anfangx-endex > 0) incrementx = -1
              else incrementx = 1
              if(anfangy-endey > 0) incrementy = -1
              else incrementy = 1
              let i = parseInt(anfangx)+incrementx;
              let j = parseInt(anfangy)+incrementy;
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
                
              }
              break;
            /*
            King
            */
            case 5:
              if (anfangx + 1 === endex && anfangy + 1 === endey) {
                
                spielzug = true;
                break;
              }
              if (anfangx + 1 === endex && anfangy + 0 === endey) {
                
                spielzug = true;
                break;
              }
              if (anfangx + 1 === endex && anfangy - 1 === endey) {
                
                spielzug = true;
                break;
              }
              if (anfangx + 0 === endex && anfangy + 1 === endey) {
                
                spielzug = true;
                break;
              }
              if (anfangx + 0 === endex && anfangy - 1 === endey) {
                
                spielzug = true;
                break;
              }
              if (anfangx - 1 === endex && anfangy + 1 === endey) {
                
                spielzug = true;
                break;
              }
              if (anfangx - 1 === endex && anfangy + 0 === endey) {
                
                spielzug = true;
            break;
          }
          if (anfangx - 1 === endex && anfangy - 1 === endey) {
            
            spielzug = true;
            break;
          }
          spielzug = false;
          break;
        /*
        Queen
        */
        case 6:
          console.log(anfangx,endex, anfangy, endey);
          if (anfangx === endex && anfangy === endey) {
            spielzug = false;
            console.log(11);
            break;
          }
          if (anfangx === endex || anfangy === endey) {
            console.log(8);
            if (anfangx === endex) {
              console.log(1);
              //Function checks if in the x axis is any piece
              let increment = (endey - anfangy) / Math.abs(endey - anfangy);
              for (let i = anfangy + increment; i != endey; i += increment) {
                console.log(increment, i);
                if (!(await getposition(anfangx, i, spiel_id))) {
                  spielzug = false;
                  break;
                }
              }
              spielzug = true;
              } 
              else if (anfangy === endey) {
                console.log(13);
              //Function checks if in the y axis is any piece
              let increment = (endex - anfangx) / Math.abs(endex - anfangx);
              for (let i = anfangx + increment; i === endex; i += increment) {
                if (!(await getposition(i, anfangy, spiel_id))) {
                  spielzug = false;
                  break;
                }
              }
              spielzug = true;
              }
          } else {
            var incrementx;
            var incrementy;
            if(anfangx-endex > 0) incrementx = -1
            else incrementx = 1
            if(anfangy-endey > 0) incrementy = -1
            else incrementy = 1
            let i = parseInt(anfangx)+incrementx;
            let j = parseInt(anfangy)+incrementy;
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
              
            }
            break;
          }
          break;
      }
      /*
    Switch for black figures
    */
    } else if (farbe === false) {
      switch (spielfigur) {
        /*
        Pawn
        */
        case 1:
          if (anfangy - endey != 1) {
            spielzug = false; // Überprüfung ob der Bauer nach vorne geht
          }
          if (
          ((await getposition(anfangx + 1, anfangy - 1, spiel_id)) &&
          anfangx + 1 === endex &&
          anfangy - 1 === endey) ||
          ((await getposition(anfangx - 1, anfangy - 1, spiel_id)) &&
          anfangx - 1 === endex &&
          anfangy - 1 === endey)
          )
          {
            spielzug = true;
             // Überprüfung ob der Bauer essen will und kann
            break; 
          }
      
          if (anfangy === 7 && !(await getposition(anfangy - 1)) && anfangy - endey === 2) {
            spielzug = true;
            break; // Überprüfung ob der Bauer 2 Felder nach vorne gehen kann
          }
      
          if (await getposition(anfangx, anfangy - 1, spiel_id)) {
            spielzug = false;
            break;
          } // Überprüft ob eine Figur vor dem Bauer steht
          if (anfangx - endex != 0) {
            spielzug = false; // Überprüfung ob der Bauer nach vorne geht
          }
          if(spielzug != false) spielzug = true;
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
            if (!(await getposition(anfangx, i, spiel_id))) {
              spielzug = false;
              break;
            }
          }
          spielzug = true;
          } 
          else if (anfangy === endey) {
          //Function checks if in the y axis is any piece
          let increment = (endex - anfangx) / Math.abs(endex - anfangx);
          for (let i = anfangx + increment; i === endex; i += increment) {
            if (!(await getposition(i, anfangy, spiel_id))) {
              spielzug = false;
              break;
            }
          }
          spielzug = true;
          }
          break;
        /*
        Knight
        */
        case 3:
          if (anfangx + 2 === endex && anfangy - 1 === endey) {
            
            spielzug = true;
            break;
          }
          if (anfangx + 2 === endex && anfangy + 1 === endey) {
            
            spielzug = true;
            break;
          }
          if (anfangx + 1 === endex && anfangy - 2 === endey) {
            
            spielzug = true;
            break;
          }
          if (anfangx + 1 === endex && anfangy + 2 === endey) {
            
            spielzug = true;
            break;
          }
          if (anfangx - 1 === endex && anfangy + 2 === endey) {
            
            spielzug = true;
            break;
          }
          if (anfangx - 1 === endex && anfangy - 2 === endey) {
            
            spielzug = true;
            break;
          }
          if (anfangx - 2 === endex && anfangy + 1 === endey) {
            
            spielzug = true;
            break;
          }
          if (anfangx - 2 === endex && anfangy - 1 === endey) {
            
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
          var incrementx;
          var incrementy;
          if(anfangx-endex > 0) incrementx = -1
          else incrementx = 1
          if(anfangy-endey > 0) incrementy = -1
          else incrementy = 1
          let i = parseInt(anfangx)+incrementx;
          let j = parseInt(anfangy)+incrementy;
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
            
          }
          break;
        /*
        King
        */
        case 5:
          if (anfangx + 1 === endex && anfangy + 1 === endey) {
            
            spielzug = true;
            break;
          }
          if (anfangx + 1 === endex && anfangy + 0 === endey) {
            
            spielzug = true;
            break;
          }
          if (anfangx + 1 === endex && anfangy - 1 === endey) {
            
            spielzug = true;
            break;
          }
          if (anfangx + 0 === endex && anfangy + 1 === endey) {
            
            spielzug = true;
            break;
          }
          if (anfangx + 0 === endex && anfangy - 1 === endey) {
            
            spielzug = true;
            break;
          }
          if (anfangx - 1 === endex && anfangy + 1 === endey) {
            
            spielzug = true;
            break;
          }
          if (anfangx - 1 === endex && anfangy + 0 === endey) {
            
            spielzug = true;
        break;
      }
      if (anfangx - 1 === endex && anfangy - 1 === endey) {
        spielzug = true;
        break;
      }
      spielzug = false;
      break;
    /*
    Queen
    */
    case 6:
      console.log(anfangx,endex, anfangy, endey);
      if (anfangx === endex && anfangy === endey) {
        spielzug = false;
        console.log(11);
        break;
      }
      if (anfangx === endex || anfangy === endey) {
        console.log(8);
        if (anfangx === endex) {
          console.log(1);
          //Function checks if in the x axis is any piece
          let increment = (endey - anfangy) / Math.abs(endey - anfangy);
          for (let i = anfangy + increment; i != endey; i += increment) {
            console.log(increment, i);
            if (!(await getposition(anfangx, i, spiel_id))) {
              spielzug = false;
              break;
            }
          }
          spielzug = true;
          } 
          else if (anfangy === endey) {
            console.log(13);
          //Function checks if in the y axis is any piece
          let increment = (endex - anfangx) / Math.abs(endex - anfangx);
          for (let i = anfangx + increment; i === endex; i += increment) {
            if (!(await getposition(i, anfangy, spiel_id))) {
              spielzug = false;
              break;
            }
          }
          spielzug = true;
          }
      } else {
        var incrementx;
        var incrementy;
        if(anfangx-endex > 0) incrementx = -1
        else incrementx = 1
        if(anfangy-endey > 0) incrementy = -1
        else incrementy = 1
        let i = parseInt(anfangx)+incrementx;
        let j = parseInt(anfangy)+incrementy;
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
        }
        break;
      }
      break;
      }
    }
    // does the moving and the eating
    const move = db.prepare("UPDATE Figuren SET X = @endex, Y =  @endey WHERE X = @anfangx AND Y = @anfangy AND Games_ID = @spiel_id");
    const get_spielzug = db.prepare("SELECT aktueller_player FROM Games WHERE Games_ID = @spiel_id");
    const change_spielzug = db.prepare("UPDATE Games SET aktueller_player = @player WHERE Games_ID = @spiel_id");
    const delete_game = db.prepare("DELETE FROM Games WHERE Games_ID = @spiel_id");
    if(spielzug === true){
      var eat_value =await eat(anfangx, anfangy ,endex, endey, spiel_id); 
      if(eat_value){
        var spiel_spieler = get_spielzug.get({spiel_id});
        console.log(eat_value);
        if(eat_value === "gefallen")
        {
          if(spiel_spieler["aktueller_player"] === 1){
            res.send("Schwarz hat gewonnen!!!");  
          }
          else{
          res.send("Weiss hat gewonnen!!!");
          }
          delete_game.run({spiel_id});
          return;
        }
        move.run({endex, endey, anfangx, anfangy, spiel_id});
        if(spiel_spieler["aktueller_player"] === 1){
        change_spielzug.run({player:0, spiel_id});
        }
        else{
        change_spielzug.run({player:1, spiel_id});
        }
        res.send("Success");
      }
      else{
        res.send("Invalid Move (You can't eat your own figure)");
      }
    }
    else{
      res.send("Invalid Move (Move is impossible)");
    }
  }
}
}
  } catch (error) {
    try{
    console.log(error);
    res.send("Error");
    }
    catch{}
  }
});

function getposition(x, y, spiel_id) {
  console.log(x, y, spiel_id, "______________");
  const check_position = db.prepare("SELECT * FROM Figuren WHERE X = @x AND Y = @y AND Games_ID = @spiel_id");
  const check = check_position.get({x, y, spiel_id});
  if(check === undefined) return false;
  else return true;
}

function eat(ax, ay,ex,ey,id){
  return new Promise(function(myResolve) {
    const besitzer_figur_m = db.prepare("SELECT Player FROM Figuren WHERE X = @ax AND Y = @ay AND Games_ID = @id");
    const check_gleich = besitzer_figur_m.get({ax,ay,id});
    const besitzer_figur_g = db.prepare("SELECT Player, Type FROM Figuren WHERE X = @ex AND Y = @ey AND Games_ID = @id");
    const check_gleich_2 = besitzer_figur_g.get({ex,ey,id});
    console.log(check_gleich_2, check_gleich);
    try{
      if(check_gleich === undefined ||  check_gleich["Player"] === check_gleich_2["Player"]){
        myResolve(false);
      }
      else{
        console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
        const deleten = db.prepare("DELETE FROM Figuren WHERE X = @ex AND Y = @ey AND Games_ID = @id");
        console.log(check_gleich_2["Type"]);
        console.log(check_gleich_2["Type"]);
        if(check_gleich_2["Type"] === 5){
          console.log("############################################################################");
          const check = deleten.run({ex,ey,id});  
          myResolve("gefallen");
        }
        const check = deleten.run({ex,ey,id});  
        myResolve(true);
      }
    }
    catch(error){
      console.log(error);
      const deleten = db.prepare("DELETE FROM Figuren WHERE X = @ex AND Y = @ey AND Games_ID = @id");
      const check = deleten.run({ex,ey,id});  
      myResolve(true);
    }
    });
  
}

app.post("/bauer_zu", async function(req, res) {
  try{
    let {KEY , spiel_id , anfangx, anfangy, zu} = req.body;
    anfangy = parseInt(anfangy);
    anfangx = parseInt(anfangx);
    zu = parseInt(zu);
    spiel_id =parseInt(spiel_id);
    if(!(await check_key(KEY))) res.send("Invalid KEY");
    else{
      var Player = await get_player(KEY);
      if(spielexist(spiel_id, Player) === "k_spiel")
      { 
        res.send("Invalid Game doesn't exist "+spielexist(spiel_id, Player));
        return;
      }
      else{
        const get_color = db.prepare("SELECT g.Player_2 FROM Figuren f LEFT JOIN Games g ON f.Player = g.Player_2 WHERE f.X = @anfangx AND f.Y = @anfangy AND f.Games_ID = @spiel_id");
        var g_color = get_color.get({anfangx, anfangy, spiel_id});
        console.log(g_color, Player);
        var linie;
        if(g_color["Player_2"] === Player) linie = 1;
        else linie = 8;
        const get_type = db.prepare("SELECT Type FROM Figuren WHERE Games_ID = @spiel_id AND X = @anfangx AND Y = @anfangy");
        var spielfigur;
        try{
          spielfigur = get_type.get({spiel_id ,anfangx, anfangy})["Type"];
        }
        catch{
          res.send("Invalid Move (No figure found)");
          return;
        }
        console.log(anfangx, linie, spielfigur);
        if(anfangy === linie && spielfigur === 1){
          if(zu > 1 && zu < 7 && zu != 5){
            const update = db.prepare("UPDATE Figuren SET Type = @zu WHERE Games_ID = @spiel_id AND X = @anfangx AND Y = @anfangy");
            update.run({spiel_id , anfangx, anfangy, zu});   
            res.send("Success");
          }
          else{
            res.send("Invalid Type");
          }
        }
        else res.send("Invalid Position");
        
      }
    }
  }
  catch(error){
    console.log(error);
    res.send("Error");
  }
})


app.get('/', function (req, res){
  res.sendFile(__dirname  + '/Login.html', '/Login.css')
})

app.get('/home', function (req, res){
  res.sendFile(__dirname  + '/home.html')
})

app.get("/get_spiel/:spiel_id", (req, res) => {
  var spiel_id = req.params.spiel_id;
  const figures = db.prepare(
    "SELECT * FROM Figuren WHERE Games_ID = @spiel_id"
  );
  var result = figures.all({spiel_id});
  res.send(result);
});

app.get("/leaderboard", (req, res) => {
  const lead_list = db.prepare(
    "SELECT Username, Wins FROM User ORDER BY Wins DESC LIMIT 10"
  );
  var result = lead_list.all();
  res.send(result);
});
// ---Leaderboard END---

// ---Your Hosted games START---
app.get("/your_live_games/:KEY", async function (req, res) {
  //KEY = TOKKEN
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  if (!(await check_key(req.params.KEY))) res.send("Invalid KEY");
  else {
    var player = get_player(req.params.KEY);
    const lead_list = db.prepare(
      "SELECT  (SELECT Username FROM User WHERE User_ID = @player ) AS m_user, g.Player_1, u.User_ID ,Games_ID, aktueller_player, u.Username AS weiss,  r.Username AS schwarz FROM Games g LEFT JOIN User u ON u.USER_ID = g.Player_1 LEFT JOIN User r ON r.USER_ID = g.Player_2 WHERE g.Player_1 = @player OR g.Player_2 = @player"
    );
    var result = lead_list.all({ player ,player,player });
    res.send(result);
  }
});
// ---Your Hosted games END---

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


