// all imports and requires
const express = require("express");
const app = express();
const port = 3004; // App running on Port 3004
const Database = require("better-sqlite3");
const db = new Database("./database.db", {});
const start = new require("./start.js");
var bodyParser = require("body-parser");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
// functionss

/*
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
All custom functions
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
*/

// checks if the key is correct and is't older than 10 minutes. Updates Time to now
function check_key(Key) {
  // check if key is in database
  const check_key = db.prepare("SELECT * FROM Key WHERE Key = @Key");
  const check = check_key.get({ Key });
  if (check != undefined) {
    // check if key is not out time
    if (new Date() / 1 - check["time"] > 6000000) {
      // delete Key
      const delete_key = db.prepare("DELETE FROM Key WHERE Key = @Key");
      delete_key.run({ Key });
      return false;
    } else {
      // set new time for key
      const update_key = db.prepare(
        "UPDATE Key SET time = @Time WHERE Key = @Key"
      );
      var Time = new Date() / 1;
      return true;
    }
  } else {
    return false;
  }
}

// returns the User_ID from the Key
function get_player(Key) {
  const get_player = db.prepare("SELECT User_FK FROM Key WHERE Key = @Key");
  return get_player.get({ Key })["User_FK"];
}

// check if spiel exist and if user has rights to access the game and it's user turn
function spielexist(spiel_id, Player) {
  // the return variable
  var wf;
  const spielexist = db.prepare(
    "SELECT Player_2, aktueller_player FROM Games WHERE (Player_2 = @Player OR Player_1 = @Player) AND Games_ID = @spiel_id"
  );
  var check_spiel = spielexist.get({ Player, spiel_id });
  // check if spiel exist
  if (check_spiel != undefined) {
    //check if it's player turn
    if (
      check_spiel["aktueller_player"] === 1 &&
      check_spiel["Player_2"] === Player
    ) {
      wf = true;
    } else if (
      check_spiel["aktueller_player"] === 0 &&
      check_spiel["Player_2"] != Player
    ) {
      wf = true;
    } else {
      // falscher spieler
      wf = "du bist nicht an der Reihe";
    }
  } else {
    // falsches Spiel
    wf = "k_spiel";
  }
  return wf;
}

// generate API Key
const genAPIKey = () => {
  //create a base-36 string that contains 30 chars in a-z,0-9
  return [...Array(300)]
    .map((e) => ((Math.random() * 36) | 0).toString(36))
    .join("");
};

// starts the game and insert all data to database. give back the game_id
function game_create(Player_1, public) {
  const get_max = db.prepare("SELECT MAX(Games_ID) FROM Games");
  var game_id = get_max.get();
  game_id = parseInt(game_id["MAX(Games_ID)"]) + 1;
  game_id++;
  const insert_game = db.prepare(
    "INSERT INTO GAMES (Player_1, aktueller_player, public) VALUES (@Player_1, false, @public)"
  );
  insert_game.run({ Player_1, public, game_id });
  return game_id - 1;
}

/*
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Beginn of the main code
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
*/


/*
Bei einem /login Post mit den Variabeln(name, password), wird folgendes ausgeführt:
1.
*/

app.post("/login", async function (req, res) {
  // to allow croo things
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  try {
    let { name, password } = req.body;
    // check if user is in database
    const check_key = db.prepare(
      "SELECT * FROM User WHERE Username= @name AND Password = @password"
    );
    const check = await check_key.get({ name, password });
    // if user exist
    if (check != undefined) {
      // generate API KEY, insert it to databse and give it back to user
      let api_key = genAPIKey();
      var time = new Date() / 1;
      const user_ID = check["User_ID"];
      const insertKEY = db.prepare(
        "INSERT INTO Key (time, User_FK, Key) VALUES (@time, @user_ID, @Key)"
      );
      insertKEY.run({ time, user_ID, Key: api_key });

      res.send(api_key);
    } else {
      // if user was not found
      res.send("Invalid wrong user or password");
    }
  } catch (error) {
    // if error happens
    console.log(error);
    res.send("Invalid wrong user or password");
  }
});

/*
Register Start
*/
console.log(1234567);
app.post("/register", async function (req, res) {
  try {
    console.log("register");
    // to allow croo things
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    let { name, password } = req.body;
    const check_key = db.prepare("SELECT * FROM User WHERE Username= @name");
    const check = await check_key.get({ name });
    // checks if users not already exist and if it is longer that 5 and shorter than 200
    if (
      check === undefined &&
      name.length >= 5 &&
      name.length <= 200 &&
      password.length > 7
    ) {
      // insert user into database
      const insertUser = db.prepare(
        "INSERT INTO User (Username, Password, Wins) VALUES (@name, @password, 0)"
      );
      var Filter = require('bad-words'),
      filter = new Filter();
      name = filter.clean(name);
      console.log(name);
      insertUser.run({ name, password });
      res.send("Account created, Your Username is: "+name);
    } else if (name.length <= 5) {
      // tells the user what is wrong
      res.send("Username is too short!");
    } else if (name.length >= 200) {
      res.send("Username is to long!");
    } else if (password.length < 7) {
      res.send("Password is too short!");
    } else {
      res.send("User already exists");
    }
  } catch (error) {
    // if error happens
    console.log(error);
    res.send("Error");
  }
});
/*
Register END
*/

// if key is correct it's create a game and insert it into databasse
app.post("/create_game", async function (req, res) {
  try {
    // to allow croo things
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    let { KEY, public } = req.body;
    if (!(await check_key(KEY))) res.send("Invalid KEY");
    else {
      // insert data to database
      var Player = await get_player(KEY);
      response = await game_create(Player, public);
      res.send(response.toString());
    }
  } catch (error) {
    // if error happens
    console.log(error);
    res.send("Error");
  }
});

// checks APi KEY and joins existing game
app.post("/join_game", async function (req, res) {
  try {
    console.log("*************");
    // to allow croo things
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    let { KEY, code } = req.body;
    const full_game = db.prepare(
      "SELECT Player_2 FROM Games WHERE Games_ID = @code AND Player_2 IS NOT NULL;"
    );
    const result = full_game.get({ code });
    console.log(result)
    //console.log(block_game.run({ code }));
    if (!(await check_key(KEY))) res.send("Invalid KEY");
    else if (result != undefined) res.send("game full");
    else {
      // when Key is correct
      const check_code = db.prepare(
        "SELECT * FROM Games WHERE Games_ID = @code"
      );
      var check = check_code.get({ code });
      if (check != undefined) {
        // when game exist
        var Player = await get_player(KEY);
        const join_game = db.prepare(
          "UPDATE Games SET Player_2 = @Player WHERE Games_ID = @code"
        );
        join_game.run({ Player, code });
        const get_player1 = db.prepare(
          "SELECT Player_1 FROM Games WHERE Games_ID = @code"
        );
        player1 = get_player1.get({ code });
        await start.game_start(player1["Player_1"], Player, code);
        res.send("Success");
        /*const block_game = db.prepare(
          "SELECT Player_2 FROM Games WHERE Games_ID = @code"
        );
        block_game.run({ code });*/
      } else {
        // if game doesn't exist
        res.send("Wrong Code");
      }
    }
  } catch (error) {
    console.log(error);
    res.send("Error");
  }
});

//----- Validated and Moves Figures -----//
/*
 Bei einem /mache_move Post mit den Variabeln(spiel_id, KEY, anfangx, anfangy, endex, endey), wird folgendes ausgeführt:
 1. Zuerst wird der gegebene KEY validiert und die Spieler id wird zurück gegeben.
 2. Mit der spiel_id und dem KEY wird nun auch das Game Validiert, ob es existiert und  
*/

app.post("/mache_move", async function (req, res) {
  try {
     // to allow croo things
     res.header("Access-Control-Allow-Origin", "*");
     res.header(
       "Access-Control-Allow-Headers",
       "Origin, X-Requested-With, Content-Type, Accept"
     );
    const move = db.prepare(
      "UPDATE Figuren SET X = @endex, Y =  @endey WHERE X = @anfangx AND Y = @anfangy AND Games_ID = @spiel_id"
    );
    let { KEY, spiel_id, anfangx, anfangy, endex, endey } = req.body;
    console.log("____",spiel_id, anfangx, anfangy, endex, endey);
    anfangy = parseInt(anfangy);
    anfangx = parseInt(anfangx);
    endex = parseInt(endex);
    endey = parseInt(endey);
    spiel_id = parseInt(spiel_id);get_player
    const get_spielzug = db.prepare(
      "SELECT aktueller_player FROM Games WHERE Games_ID = @spiel_id"
    );
    const delete_game = db.prepare(
      "DELETE FROM Games WHERE Games_ID = @spiel_id"
    );
    const change_spielzug = db.prepare(
      "UPDATE Games SET aktueller_player = @player WHERE Games_ID = @spiel_id"
    );
    if (!(await check_key(KEY))) res.send("Invalid KEY");
    else {
      var Player = get_player(KEY);
      if (
        spielexist(spiel_id, Player) === "k_spiel" ||
        spielexist(spiel_id, Player) === "du bist nicht an der Reihe"
      ) {
        res.send(spielexist(spiel_id, Player));
        return;
      } else {
        const get_type = db.prepare(
          "SELECT Type FROM Figuren WHERE Games_ID = @spiel_id AND X = @anfangx AND Y = @anfangy"
        );
        var spielfigur;
        try {
          spielfigur = get_type.get({ spiel_id, anfangx, anfangy })["Type"];
        } catch {
          res.send("Invalid Move (No figure found)");
          return;
        }
        const get_player = db.prepare(
          "SELECT Player FROM Figuren WHERE Games_ID = @spiel_id AND X = @anfangx AND Y = @anfangy"
        );
        try {
          var get_player_f = get_player.get({ spiel_id, anfangx, anfangy })[
            "Player"
          ];
        } catch {}
        if (!(get_player_f === Player)) {
          res.send("Invalid Move (wrong player)");
          return;
        } else {
          const get_color = db.prepare(
            "SELECT g.Player_2 FROM Figuren f LEFT JOIN Games g ON f.Games_ID = g.Games_ID WHERE f.X = @anfangx AND f.Y = @anfangy AND f.Games_ID = @spiel_id"
          );
          console.log(anfangx, anfangy, spiel_id);
          var g_color = get_color.get({ anfangx, anfangy, spiel_id });
          var farbe; // true = weiss false = schwarz
          console.log(g_color, Player);
          if (g_color["Player_2"] === Player) farbe = false;
          else farbe = true;
          var spielzug;
          // check if they arent the same and in the playground
          if (anfangx === endex && anfangy === endey) {
            spielzug = false;
            res.send("Invalid Move (The coordinates are equal)");
          }
          if (
            anfangx < 1 ||
            anfangx > 8 ||
            anfangy < 1 ||
            anfangy > 8 ||
            endex < 1 ||
            endex > 8 ||
            endex < 1 ||
            endex > 8
          ) {
            spielzug = false;
            res.send("Invalid Move (Coordinates are not on the field)");
          }
          /*
          Switch for White Figures
          */
         console.log(farbe);
          if (farbe === true) {
            console.log(spielfigur);
            switch (spielfigur) {
              /*
              Pawn
              */
              case 1:
                console.log("Pawn");
                if (anfangy - endey != -1) {
                  spielzug = false; // Überprüfung ob der Bauer nach vorne geht
                }
                if (
                  (await getposition(anfangx + 1, anfangy + 1, spiel_id)) &&
                  anfangx + 1 === endex &&
                  anfangy + 1 === endey
                ) {
                  spielzug = true;
                  // Überprüfung ob der Bauer essen will und kann
                  break;
                }
                if (
                  (await getposition(anfangx - 1, anfangy + 1, spiel_id)) &&
                  anfangx - 1 === endex &&
                  anfangy + 1 === endey
                ) {
                  spielzug = true;
                  // Überprüfung ob der Bauer essen will und kann
                  break;
                }
                // check if enPassant
                if (
                  (await getposition(anfangx + 1, anfangy, spiel_id)) &&
                  anfangx + 1 === endex &&
                  anfangy + 1 === endey &&
                  endey === 6
                ) {
                  const get_modus = db.prepare(
                    "SELECT Modus FROM Figuren WHERE  X = @anfangx AND Y = @anfangy AND Games_ID = @spiel_id AND Modus = 1"
                  );
                  if (get_modus.get({ anfangx, anfangy, spiel_id })) {
                    spielzug = true;
                    eat(anfangx, anfangy, endex, endey - 1, spiel_id);
                    break;
                  }
                }

                if (
                  (await getposition(anfangx - 1, anfangy, spiel_id)) &&
                  anfangx - 1 === endex &&
                  anfangy + 1 === endey &&
                  endey === 6
                ) {
                  const get_modus = db.prepare(
                    "SELECT Modus FROM Figuren WHERE  X = @anfangx AND Y = @anfangy AND Games_ID = @spiel_id AND Modus = 1"
                  );
                  if (get_modus.get({ anfangx, anfangy, spiel_id })) {
                    spielzug = true;
                    eat(anfangx, anfangy, endex, endey - 1, spiel_id);
                    break;
                  }
                }

                if (
                  anfangy === 2 &&
                  !(await getposition(anfangy + 1)) &&
                  anfangy - endey === -2 &&
                  anfangx === endex
                ) {
                  const set_modus = db.prepare(
                    "UPDATE FIGUREN SET Modus = 1 WHERE  X = @anfangx AND Y = @anfangy AND Games_ID = @spiel_id"
                  );
                  set_modus.run({ anfangx, anfangy, spiel_id });
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
                if (spielzug != false) spielzug = true;
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
                  for (
                    let i = anfangy + increment;
                    i !== endey;
                    i += increment
                  ) {
                    if ((await getposition(anfangx, i, spiel_id))) {
                      spielzug = false;
                      break;
                    }
                  }
                  if(spielzug === undefined) spielzug = true;
                } else if (anfangy === endey) {
                  //Function checks if in the y axis is any piece
                  let increment = (endex - anfangx) / Math.abs(endex - anfangx);
                  for (
                    let i = anfangx + increment;
                    i != endex;
                    i += increment
                  ) {
                    if ((await getposition(i, anfangy, spiel_id))) {
                      spielzug = false;
                      break;
                    }
                  }
                  if(spielzug === undefined) spielzug = true;
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
                if (anfangx - endex > 0) incrementx = -1;
                else incrementx = 1;
                if (anfangy - endey > 0) incrementy = -1;
                else incrementy = 1;
                let i = parseInt(anfangx) + incrementx;
                let j = parseInt(anfangy) + incrementy;
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
                console.log("******************************");
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
                const get_type = db.prepare(
                  "SELECT Type FROM Figuren WHERE Games_ID = @spiel_id AND X = @anfangx AND Y = @anfangy"
                );
                // checks if you want to change Turm with the König
                if (
                  (anfangx === 5 && anfangy === 1 && endex === 1 && endey === 1)
                ) {
                  if (
                    (await !getposition(4, 1, spiel_id)) &&
                    (await !getposition(2, 1, spiel_id)) &&
                    (await !getposition(3, 1, spiel_id))
                  ) {
                    if (
                      get_type.get({ spiel_id, anfangx: 1, anfangy: 1 })["Type"] ===
                        2 &&
                      get_type.get({ spiel_id, anfangx: 5, anfangy: 1 })["Type"] ===
                        5
                    ) {
                      change_player();
                      move.run({
                        endex: 3,
                        endey: 1,
                        anfangx: 1,
                        anfangy: 1,
                        spiel_id,
                      });
                      move.run({
                        endex: 2,
                        endey: 1,
                        anfangx: 5,
                        anfangy: 1,
                        spiel_id,
                      });
                      spielzug = true;
                      res.send("Success");
                      return;
                    }
                  }
                }
                if (
                  (anfangx === 5 && anfangy === 1 && endex === 8 && endey === 1)
                ) {
                  if (
                    (await !getposition(6, 1, spiel_id)) &&
                    (await !getposition(7, 1, spiel_id))
                  ) {
                    if (
                      get_type.get({ spiel_id, anfangx: 8, anfangy: 1 })["Type"] ===
                        2 &&
                      get_type.get({ spiel_id, anfangx: 5, anfangy: 1 })["Type"] ===
                        5
                    ) {
                      change_player();
                      move.run({
                        endex: 7,
                        endey: 1,
                        anfangx: 5,
                        anfangy: 1,
                        spiel_id,
                      });
                      move.run({
                        endex: 6,
                        endey: 1,
                        anfangx: 8,
                        anfangy: 1,
                        spiel_id,
                      });
                      spielzug = true;
                      res.send("Success");
                      return;
                    }
                  }
                }
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
                    let increment =
                      (endey - anfangy) / Math.abs(endey - anfangy);
                    for (
                      let i = anfangy + increment;
                      i != endey;
                      i += increment
                    ) {
                      if ((await getposition(anfangx, i, spiel_id))) {
                        spielzug = false;
                        break;
                      }
                    }
                    if(spielzug === undefined) spielzug = true;
                  } else if (anfangy === endey) {
                    //Function checks if in the y axis is any piece
                    let increment =
                      (endex - anfangx) / Math.abs(endex - anfangx);
                    for (
                      let i = anfangx + increment;
                      i === endex;
                      i += increment
                    ) {
                      if ((await getposition(i, anfangy, spiel_id))) {
                        spielzug = false;
                        break;
                      }
                    }
                    if(spielzug === undefined) spielzug = true;
                  }
                } else {
                  var incrementx;
                  var incrementy;
                  if (anfangx - endex > 0) incrementx = -1;
                  else incrementx = 1;
                  if (anfangy - endey > 0) incrementy = -1;
                  else incrementy = 1;
                  let i = parseInt(anfangx) + incrementx;
                  let j = parseInt(anfangy) + incrementy;
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
                  (await getposition(anfangx + 1, anfangy - 1, spiel_id)) &&
                  anfangx + 1 === endex &&
                  anfangy - 1 === endey
                ) {
                  spielzug = true;
                  // Überprüfung ob der Bauer essen will und kann
                  break;
                }
                if (
                  (await getposition(anfangx - 1, anfangy - 1, spiel_id)) &&
                  anfangx - 1 === endex &&
                  anfangy - 1 === endey
                ) {
                  spielzug = true;
                  // Überprüfung ob der Bauer essen will und kann
                  break;
                }
                // check if enPassant
                if (
                  (await getposition(anfangx + 1, anfangy, spiel_id)) &&
                  anfangx + 1 === endex &&
                  anfangy - 1 === endey &&
                  endey === 3
                ) {
                  const get_modus = db.prepare(
                    "SELECT Modus FROM Figuren WHERE  X = @anfangx AND Y = @anfangy AND Games_ID = @spiel_id AND Modus = 1"
                  );
                  if (get_modus.get({ anfangx, anfangy, spiel_id })) {
                    spielzug = true;
                    eat(anfangx, anfangy, endex, endey + 1, spiel_id);
                    break;
                  }
                }

                if (
                  (await getposition(anfangx - 1, anfangy, spiel_id)) &&
                  anfangx - 1 === endex &&
                  anfangy - 1 === endey &&
                  endey === 3
                ) {
                  const get_modus = db.prepare(
                    "SELECT Modus FROM Figuren WHERE  X = @anfangx AND Y = @anfangy AND Games_ID = @spiel_id AND Modus = 1"
                  );
                  if (get_modus.get({ anfangx, anfangy, spiel_id })) {
                    spielzug = true;
                    eat(anfangx, anfangy, endex, endey + 1, spiel_id);
                    break;
                  }
                }

                if (
                  anfangy === 7 &&
                  !(await getposition(anfangy - 1)) &&
                  anfangy - endey === 2
                ) {
                  const set_modus = db.prepare(
                    "UPDATE FIGUREN SET Modus = 1 WHERE  X = @anfangx AND Y = @anfangy AND Games_ID = @spiel_id"
                  );
                  set_modus.run({ anfangx, anfangy, spiel_id });
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
                if (spielzug != false) spielzug = true;
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
                  for (
                    let i = anfangy + increment;
                    i !== endey;
                    i += increment
                  ) {
                    if ((await getposition(anfangx, i, spiel_id))) {
                      spielzug = false;
                      break;
                    }
                  }
                  if(spielzug === undefined) spielzug = true;
                } else if (anfangy === endey) {
                  //Function checks if in the y axis is any piece
                  let increment = (endex - anfangx) / Math.abs(endex - anfangx);
                  for (
                    let i = anfangx + increment;
                    i === endex;
                    i += increment
                  ) {
                    if ((await getposition(i, anfangy, spiel_id))) {
                      spielzug = false;
                      break;
                    }
                  }
                  if(spielzug === undefined) spielzug = true;
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
                if (anfangx - endex > 0) incrementx = -1;
                else incrementx = 1;
                if (anfangy - endey > 0) incrementy = -1;
                else incrementy = 1;
                let i = parseInt(anfangx) + incrementx;
                let j = parseInt(anfangy) + incrementy;
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
               

                const get_type = db.prepare(
                  "SELECT Type FROM Figuren WHERE Games_ID = @spiel_id AND X = @anfangx AND Y = @anfangy"
                );
                // checks if you want to change Turm with the König
                if (
                  (anfangx === 1 && anfangy === 8 && endex === 5 && endey === 8)
                ) {
                  if (
                    (await !getposition(4, 8, spiel_id)) &&
                    (await !getposition(2, 8, spiel_id)) &&
                    (await !getposition(3, 8, spiel_id))
                  ) {
                    if (
                      get_type.get({ spiel_id, anfangx: 1, anfangy: 8 })["Type"] ===
                        2 &&
                      get_type.get({ spiel_id, anfangx: 5, anfangy: 8 })["Type"] ===
                        5
                    ) {
                      change_player();
                      move.run({
                        endex: 3,
                        endey: 8,
                        anfangx: 1,
                        anfangy: 8,
                        spiel_id,
                      });
                      move.run({
                        endex: 2,
                        endey: 8,
                        anfangx: 5,
                        anfangy: 8,
                        spiel_id,
                      });
                      spielzug = true;
                      res.send("Success");
                      return;
                    }
                  }
                }
                if (
                  (anfangx === 5 && anfangy === 8 && endex === 8 && endey === 8)
                ) {
                  if (
                    (await !getposition(6, 8, spiel_id)) &&
                    (await !getposition(7, 8, spiel_id))
                  ) {
                    if (
                      get_type.get({ spiel_id, anfangx, anfangy })["Type"] === 5 &&
                      get_type.get({ spiel_id, anfangx: endex, anfangy })["Type"] === 2
                    ) {
                      change_player();
                      move.run({
                        endex: 7,
                        endey: 8,
                        anfangx: 5,
                        anfangy: 8,
                        spiel_id,
                      });
                      move.run({
                        endex: 6,
                        endey: 8,
                        anfangx: 8,
                        anfangy: 8,
                        spiel_id,
                      });
                      spielzug = true;
                      res.send("Success");
                      return;
                    }
                  }
                }
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
                    let increment =
                      (endey - anfangy) / Math.abs(endey - anfangy);
                    for (
                      let i = anfangy + increment;
                      i != endey;
                      i += increment
                    ) {
                      if ((await getposition(anfangx, i, spiel_id))) {
                        spielzug = false;
                        break;
                      }
                    }
                    if(spielzug === undefined) spielzug = true;
                  } else if (anfangy === endey) {
                    //Function checks if in the y axis is any piece
                    let increment =
                      (endex - anfangx) / Math.abs(endex - anfangx);
                    for (
                      let i = anfangx + increment;
                      i === endex;
                      i += increment
                    ) {
                      if ((await getposition(i, anfangy, spiel_id))) {
                        spielzug = false;
                        break;
                      }
                    }
                    if(spielzug === undefined) spielzug = true;
                  }
                } else {
                  var incrementx;
                  var incrementy;
                  if (anfangx - endex > 0) incrementx = -1;
                  else incrementx = 1;
                  if (anfangy - endey > 0) incrementy = -1;
                  else incrementy = 1;
                  let i = parseInt(anfangx) + incrementx;
                  let j = parseInt(anfangy) + incrementy;
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
          if (spielzug === true) {
            var eat_value = await eat(anfangx, anfangy, endex, endey, spiel_id);
            if (eat_value) {
              var spiel_spieler = get_spielzug.get({ spiel_id });
              if (eat_value === "gefallen") {
                if (spiel_spieler["aktueller_player"] === 1) {
                  const get_score = db.prepare(
                    "SELECT p.Wins AS wins, p.User_ID AS ID  FROM Games g LEFT JOIN User p ON g.Player_2 = p.User_ID WHERE Games_ID = @spiel_id"
                  );
                  console.log( get_score.get({spiel_id}));
                  const insert_score = db.prepare(
                    "UPDATE User SET Wins = @wins WHERE User_ID = @ID"
                  );
                  var data = get_score.get({spiel_id});
                  insert_score.run({wins: parseInt(data["wins"])+1, ID: data["ID"]});
                  res.send("Schwarz hat gewonnen!!!");


                } else {
                  const get_score = db.prepare(
                    "SELECT p.Wins AS wins, p.User_ID AS ID  FROM Games g LEFT JOIN User p ON g.Player_1 = p.User_ID WHERE Games_ID = @spiel_id"
                  );
                  console.log( get_score.get({spiel_id}));
                  const insert_score = db.prepare(
                    "UPDATE User SET Wins = @wins WHERE User_ID = @ID"
                  );
                  var data = get_score.get({spiel_id});
                  insert_score.run({wins: parseInt(data["wins"])+1, ID: data["ID"]});
                  
                  res.send("Weiss hat gewonnen!!!");
                }
                  var gewinner = spiel_spieler["aktueller_player"];
                  const get_spielzug = db.prepare(
                  "SELECT aktueller_player FROM Games WHERE Games_ID = @spiel_id"
                  );
                  var aktueller_player = get_spielzug.get({ spiel_id });
                  var clean_player = aktueller_player.aktueller_player;
                  const win = db.prepare(
                  "UPDATE User SET Wins = Wins + 1 WHERE User_ID = @clean_player"
                  )
                console.log("Running win")
                win.run({ clean_player });
                delete_game.run({ spiel_id });
                return;
              }
              move.run({ endex, endey, anfangx, anfangy, spiel_id });
              if (spiel_spieler["aktueller_player"] === 1) {
                change_spielzug.run({ player: 0, spiel_id });
              } else {
                change_spielzug.run({ player: 1, spiel_id });
              }
              res.send("Success");
            } else {
              res.send("Invalid Move (You can't eat your own figure)");
            }
          } else {
            res.send("Invalid Move (Move is impossible)");
          }
          // the change player function
          function change_player() {
            var aktueller_spieler = get_spielzug.get({ spiel_id });
            if (aktueller_spieler["aktueller_player"] === 1) {
              change_spielzug.run({ player: 0, spiel_id });
            } else {
              change_spielzug.run({ player: 1, spiel_id });
            }
          }
        }
      }
    }
  } catch (error) {
    try {
      console.log(error);
      res.send("Error");
    } catch {}
  }
});

function getposition(x, y, spiel_id) {
  const check_position = db.prepare(
    "SELECT * FROM Figuren WHERE X = @x AND Y = @y AND Games_ID = @spiel_id"
  );
  const check = check_position.get({ x, y, spiel_id });
  if (check === undefined) return false;
  else return true;
}

function eat(ax, ay, ex, ey, id) {
  return new Promise(function (myResolve) {
    const besitzer_figur_m = db.prepare(
      "SELECT Player FROM Figuren WHERE X = @ax AND Y = @ay AND Games_ID = @id"
    );
    const check_gleich = besitzer_figur_m.get({ ax, ay, id });
    const besitzer_figur_g = db.prepare(
      "SELECT Player, Type FROM Figuren WHERE X = @ex AND Y = @ey AND Games_ID = @id"
    );
    const check_gleich_2 = besitzer_figur_g.get({ ex, ey, id });
    try {
      if (check_gleich["Player"] === check_gleich_2["Player"]) {
        myResolve(false);
      } else {
        const deleten = db.prepare(
          "DELETE FROM Figuren WHERE X = @ex AND Y = @ey AND Games_ID = @id"
        );
        if (check_gleich_2["Type"] === 5) {
          const check = deleten.run({ ex, ey, id });
          myResolve("gefallen");
        }
        const check = deleten.run({ ex, ey, id });
        myResolve(true);
      }
    } catch (error) {
      const deleten = db.prepare(
        "DELETE FROM Figuren WHERE X = @ex AND Y = @ey AND Games_ID = @id"
      );
      const check = deleten.run({ ex, ey, id });
      myResolve(true);
    }
  });
}

app.post("/bauer_zu", async function (req, res) {
  try {
    let { KEY, spiel_id, anfangx, anfangy, zu } = req.body;
    anfangy = parseInt(anfangy);
    anfangx = parseInt(anfangx);
    zu = parseInt(zu);
    spiel_id = parseInt(spiel_id);
    if (!(await check_key(KEY))) res.send("Invalid KEY");
    else {
      var Player = await get_player(KEY);
      if (spielexist(spiel_id, Player) === "k_spiel") {
        res.send("Invalid Game doesn't exist " + spielexist(spiel_id, Player));
        return;
      } else {
        const get_color = db.prepare(
          "SELECT g.Player_2 FROM Figuren f LEFT JOIN Games g ON f.Player = g.Player_2 WHERE f.X = @anfangx AND f.Y = @anfangy AND f.Games_ID = @spiel_id"
        );
        var g_color = get_color.get({ anfangx, anfangy, spiel_id });
        var linie;
        if (g_color["Player_2"] === Player) linie = 1;
        else linie = 8;
        const get_type = db.prepare(
          "SELECT Type FROM Figuren WHERE Games_ID = @spiel_id AND X = @anfangx AND Y = @anfangy"
        );
        var spielfigur;
        try {
          spielfigur = get_type.get({ spiel_id, anfangx, anfangy })["Type"];
        } catch {
          res.send("Invalid Move (No figure found)");
          return;
        }
        if (anfangy === linie && spielfigur === 1) {
          if (zu > 1 && zu < 7 && zu != 5) {
            const update = db.prepare(
              "UPDATE Figuren SET Type = @zu WHERE Games_ID = @spiel_id AND X = @anfangx AND Y = @anfangy"
            );
            update.run({ spiel_id, anfangx, anfangy, zu });
            res.send("Success");
          } else {
            res.send("Invalid Type");
          }
        } else res.send("Invalid Position");
      }
    }
  } catch (error) {
    console.log(error);
    res.send("Error");
  }
});

app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/Frontend/Login.html", "/Login.css"); //hier mit CSS
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/Frontend/home.html");
});

app.get("/signup", function (req, res) {
  res.sendFile(__dirname + "/Frontend/register.html");
});

app.get("/get_spiel/:spiel_id", (req, res) => {
    // to allow croo things
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
  var spiel_id = req.params.spiel_id;
  const figures = db.prepare(
    "SELECT * FROM Figuren WHERE Games_ID = @spiel_id"
  );
  var result = figures.all({ spiel_id });
  res.send(result);
});

app.get("/leaderboard", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  const lead_list = db.prepare(
    "SELECT Username, Wins FROM User ORDER BY Wins DESC LIMIT 10"
  );
  var result = lead_list.all();
  res.send(result);
});
// ---Leaderboard END---

app.get("/Game", function (req, res) {
  res.sendFile(__dirname + "/Frontend/Spielpage.html", "/spielpage.css");
});

app.get("/watch", function (req, res) {
  res.sendFile(__dirname + "/Frontend/watch.html", "/spielpage.css");
});

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
    var result = lead_list.all({ player, player, player });
    res.send(result);
  }
});
// ---Your Hosted games END---

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.post("/draw", async function (req, res) {
  let { KEY, spiel_id } = req.body;
  try {
    if (!(await check_key(KEY))) res.send("Invalid KEY");
    else {
      var Player = get_player(KEY);
      if (spielexist(spiel_id, Player) == "k_spiel") {
        res.send("Invalid Game doesn't exist " + spielexist(spiel_id, Player));
        return;
      } else { //Tries to find games with spiel_id where drawing player is player_1 or player_2
        const lock_draw = db.prepare(
          "UPDATE Games SET draw_Player_1 = 1 WHERE Games_ID = @spiel_id AND Player_1 = @Player"
        );
        const lock_draw2 = db.prepare(
          "UPDATE Games SET draw_Player_2 = 1 WHERE Games_ID = @spiel_id AND Player_2 = @Player"
        );
        lock_draw.run({ spiel_id, Player });
        lock_draw2.run({ spiel_id, Player });
        //-------SQL COMMANDS FOR CHECKING DRAW STATUS-------
        const draw_been_made_Player_1 = db.prepare(
                "SELECT draw_Player_1 FROM Games WHERE Games_ID = @spiel_id AND (Player_1 = @Player OR Player_2 = @Player)"
              );
          const draw_been_made_Player_2 = db.prepare(
                          "SELECT draw_Player_2 FROM Games WHERE Games_ID = @spiel_id AND (Player_1 = @Player OR Player_2 = @Player)"
                        );
              var check_spiel_P1 = draw_been_made_Player_1.get({ Player, spiel_id });
              var check_spiel_P2 = draw_been_made_Player_2.get({ Player, spiel_id });
              if (check_spiel_P1.draw_Player_1 === 0 || check_spiel_P2.draw_Player_2 === 0) {
                res.send("Some didn't draw yet");
              }
              else { res.send("Drawn!");
              const delete_game = db.prepare(
                    "DELETE FROM Games WHERE Games_ID = @spiel_id"
                  );
                console.log("delete_game");
                delete_game.run({ spiel_id });
            }
      }
    }
  } catch (error) {
    console.log(error);
    res.send("Error");
  }
});


//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
// beginn of the chat
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------
app.post("/get_chat", async function(req, res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  try{
    let {KEY, spiel_id} = req.body;
    if (!(await check_key(KEY))) res.send("Invalid KEY");
    else{
      var Player = get_player(KEY);
      const spielexist = db.prepare(
        "SELECT Player_2, aktueller_player FROM Games WHERE (Player_2 = @Player OR Player_1 = @Player) AND Games_ID = @spiel_id"
      );
      var check_spiel = spielexist.get({ Player, spiel_id });
      // check if spiel exist
      if (check_spiel != undefined) {
        const get_chat = db.prepare(
          "SELECT Text, Username FROM messages m LEFT JOIN User u ON m.Spieler_ID = u.User_ID WHERE m.Game_ID = @spiel_id"
        );
        res.send(get_chat.all({spiel_id }))
      }
      else res.send("not found");   
    }
  }
  catch(error){
    console.log(error);
    res.send("Error");
  }
})

app.post("/send_chat", async function(req, res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  try{
    let {KEY, spiel_id, message} = req.body;
    if (!(await check_key(KEY))) res.send("Invalid KEY");
    else{
      var Player = get_player(KEY);
      const spielexist = db.prepare(
        "SELECT Player_2, aktueller_player FROM Games WHERE (Player_2 = @Player OR Player_1 = @Player) AND Games_ID = @spiel_id"
      );
      var check_spiel = spielexist.get({ Player, spiel_id });
      // check if spiel exist
      if (check_spiel != undefined) {
        const get_chat = db.prepare(
          "INSERT INTO messages (Game_ID, Text, Spieler_ID) VALUES (@spiel_id, @message, @Player)"
        );
        get_chat.run({spiel_id, message, Player })
        res.send("Success")
      }
      else res.send("not found");   
    }
  }
  catch(error){
    console.log(error);
    res.send("Error");
  }
})


