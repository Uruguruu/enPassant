const Database = require("better-sqlite3");
const db = new Database("./database.db", {});
module.exports =  {
// insert all the figures to the database
game_start: function (Player_1, Player_2, game_id) {
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
};