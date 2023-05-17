const Database = require("better-sqlite3");
const db = new Database("./database.db", {});
module.exports =  {
make_move: app.post("/mache_move", async function (req, res) {
    try {
      const move = db.prepare(
        "UPDATE Figuren SET X = @endex, Y =  @endey WHERE X = @anfangx AND Y = @anfangy AND Games_ID = @spiel_id"
      );
      let { KEY, spiel_id, anfangx, anfangy, endex, endey } = req.body;
      anfangy = parseInt(anfangy);
      anfangx = parseInt(anfangx);
      endex = parseInt(endex);
      endey = parseInt(endey);
      spiel_id = parseInt(spiel_id);
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
          spielexist(spiel_id, Player) === "f_player"
        ) {
          res.send("Invalid Game doesn't exist " + spielexist(spiel_id, Player));
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
              "SELECT g.Player_2 FROM Figuren f LEFT JOIN Games g ON f.Player = g.Player_2 WHERE f.X = @anfangx AND f.Y = @anfangy AND f.Games_ID = @spiel_id"
            );
            var g_color = get_color.get({ anfangx, anfangy, spiel_id });
            console.log(g_color, Player);
            var farbe; // true = weiss false = schwarz
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
            if (farbe === true) {
              switch (spielfigur) {
                /*
                Pawn
                */
                case 1:
                  console.log(await getposition(anfangx - 1, anfangy, spiel_id));
                  console.log(anfangx - 1 === endex && anfangy + 1 === endey);
                  console.log(1);
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
                  console.log(await getposition(anfangx - 1, anfangy, spiel_id));
                  console.log(anfangx - 1 === endex && anfangy + 1 === endey);
  
                  if (
                    (await getposition(anfangx - 1, anfangy, spiel_id)) &&
                    anfangx - 1 === endex &&
                    anfangy + 1 === endey &&
                    endey === 6
                  ) {
                    console.log(5);
                    const get_modus = db.prepare(
                      "SELECT Modus FROM Figuren WHERE  X = @anfangx AND Y = @anfangy AND Games_ID = @spiel_id AND Modus = 1"
                    );
                    if (get_modus.get({ anfangx, anfangy, spiel_id })) {
                      console.log(56);
                      spielzug = true;
                      eat(anfangx, anfangy, endex, endey - 1, spiel_id);
                      break;
                    }
                  }
  
                  if (
                    anfangy === 2 &&
                    !(await getposition(anfangy + 1)) &&
                    anfangy - endey === -2
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
                  console.log();
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
                      if (!(await getposition(anfangx, i, spiel_id))) {
                        spielzug = false;
                        break;
                      }
                    }
                    spielzug = true;
                  } else if (anfangy === endey) {
                    //Function checks if in the y axis is any piece
                    let increment = (endex - anfangx) / Math.abs(endex - anfangx);
                    for (
                      let i = anfangx + increment;
                      i === endex;
                      i += increment
                    ) {
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
                  break;
                /*
          Queen
          */
                case 6:
                  console.log(anfangx, endex, anfangy, endey);
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
                      let increment =
                        (endey - anfangy) / Math.abs(endey - anfangy);
                      for (
                        let i = anfangy + increment;
                        i != endey;
                        i += increment
                      ) {
                        console.log(increment, i);
                        if (!(await getposition(anfangx, i, spiel_id))) {
                          spielzug = false;
                          break;
                        }
                      }
                      spielzug = true;
                    } else if (anfangy === endey) {
                      console.log(13);
                      //Function checks if in the y axis is any piece
                      let increment =
                        (endex - anfangx) / Math.abs(endex - anfangx);
                      for (
                        let i = anfangx + increment;
                        i === endex;
                        i += increment
                      ) {
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
              const get_type = db.prepare(
                "SELECT Type FROM Figuren WHERE Games_ID = @spiel_id AND X = @anfangx AND Y = @anfangy"
              );
              // checks if you want to change Turm with the König
              if (
                (anfangx === 1 && anfangy === 1 && endex === 4 && endey === 1) ||
                (anfangx === 4 && anfangy === 1 && endex === 8 && endey === 1)
              ) {
                if (
                  (await !getposition(2, 1, spiel_id)) &&
                  (await !getposition(3, 1, spiel_id))
                ) {
                  if (
                    get_type.get({ spiel_id, anfangx: 1, anfangy: 1 })["Type"] ===
                      2 &&
                    get_type.get({ spiel_id, anfangx: 4, anfangy: 1 })["Type"] ===
                      6
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
                      anfangx: 4,
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
                (anfangx === 8 && anfangy === 1 && endex === 4 && endey === 1) ||
                (anfangx === 4 && anfangy === 1 && endex === 8 && endey === 1)
              ) {
                if (
                  (await !getposition(5, 1, spiel_id)) &&
                  (await !getposition(6, 1, spiel_id)) &&
                  (await !getposition(7, 1, spiel_id))
                ) {
                  if (
                    get_type.get({ spiel_id, anfangx, anfangy })["Type"] === 2 &&
                    get_type.get({ spiel_id, anfangx, anfangy })["Type"] === 6
                  ) {
                    change_player();
                    move.run({
                      endex: 8,
                      endey: 1,
                      anfangx: 4,
                      anfangy: 1,
                      spiel_id,
                    });
                    move.run({
                      endex: 4,
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
                      if (!(await getposition(anfangx, i, spiel_id))) {
                        spielzug = false;
                        break;
                      }
                    }
                    spielzug = true;
                  } else if (anfangy === endey) {
                    //Function checks if in the y axis is any piece
                    let increment = (endex - anfangx) / Math.abs(endex - anfangx);
                    for (
                      let i = anfangx + increment;
                      i === endex;
                      i += increment
                    ) {
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
                  break;
                /*
      Queen
      */
                case 6:
                  console.log(anfangx, endex, anfangy, endey);
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
                      let increment =
                        (endey - anfangy) / Math.abs(endey - anfangy);
                      for (
                        let i = anfangy + increment;
                        i != endey;
                        i += increment
                      ) {
                        console.log(increment, i);
                        if (!(await getposition(anfangx, i, spiel_id))) {
                          spielzug = false;
                          break;
                        }
                      }
                      spielzug = true;
                    } else if (anfangy === endey) {
                      console.log(13);
                      //Function checks if in the y axis is any piece
                      let increment =
                        (endex - anfangx) / Math.abs(endex - anfangx);
                      for (
                        let i = anfangx + increment;
                        i === endex;
                        i += increment
                      ) {
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
              const get_type = db.prepare(
                "SELECT Type FROM Figuren WHERE Games_ID = @spiel_id AND X = @anfangx AND Y = @anfangy"
              );
              // checks if you want to change Turm with the König
              if (
                (anfangx === 8 && anfangy === 8 && endex === 4 && endey === 8) ||
                (anfangx === 4 && anfangy === 8 && endex === 8 && endey === 8)
              ) {
                if (
                  (await !getposition(2, 8, spiel_id)) &&
                  (await !getposition(3, 8, spiel_id))
                ) {
                  if (
                    get_type.get({ spiel_id, anfangx: 8, anfangy: 8 })["Type"] ===
                      2 &&
                    get_type.get({ spiel_id, anfangx: 4, anfangy: 8 })["Type"] ===
                      6
                  ) {
                    change_player();
                    move.run({
                      endex: 3,
                      endey: 8,
                      anfangx: 8,
                      anfangy: 8,
                      spiel_id,
                    });
                    move.run({
                      endex: 2,
                      endey: 8,
                      anfangx: 4,
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
                (anfangx === 8 && anfangy === 8 && endex === 4 && endey === 8) ||
                (anfangx === 4 && anfangy === 8 && endex === 8 && endey === 8)
              ) {
                if (
                  (await !getposition(5, 8, spiel_id)) &&
                  (await !getposition(6, 8, spiel_id)) &&
                  (await !getposition(7, 8, spiel_id))
                ) {
                  if (
                    get_type.get({ spiel_id, anfangx, anfangy })["Type"] === 2 &&
                    get_type.get({ spiel_id, anfangx, anfangy })["Type"] === 6
                  ) {
                    change_player();
                    move.run({
                      endex: 8,
                      endey: 8,
                      anfangx: 4,
                      anfangy: 8,
                      spiel_id,
                    });
                    move.run({
                      endex: 4,
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
            }
            // does the moving and the eating
            if (spielzug === true) {
              var eat_value = await eat(anfangx, anfangy, endex, endey, spiel_id);
              if (eat_value) {
                var spiel_spieler = get_spielzug.get({ spiel_id });
                console.log(eat_value);
                if (eat_value === "gefallen") {
                  if (spiel_spieler["aktueller_player"] === 1) {
                    res.send("Schwarz hat gewonnen!!!");
                  } else {
                    res.send("Weiss hat gewonnen!!!");
                  }
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
  })
};