# enPassant
Project repository for a Chess Game made in two weeks.

## Funktionen

##### Wir haben ein Login bei der sich der User Registrieren und danach Anmelden kann. Er bekommt dann auch einen Key mit dem er dann sich autentifiziert.

##### Danach kommt eine Übersicht von allen angefangenen Spielen, die man dann öffnen kann und weiterspielen kann wenn man am Zug ist

##### Man kann auch ein neues Spiel erstellen. Dabei gibt es 2 Varianten
1. Man macht es lokal und  spielt gegen sich selbst (optional)
2. Man erstelt online ein Spiel und man kriegt dann einen Spiel-Code den man dann bei jemandem anders eingeben kann und somit gegeneinander Schach spielt

##### Wir haben ein Schachbrett das mit drag and drop funktioniert

##### Sobald jemand ein Zug macht wird eine request an das Backend gesendet und dieses überprüft dann, ob der Spieler am Zug ist und ob der Spielzug auch möglich ist. Das frontend aktualisiert danach das Spielfeld

## API

description: `If feed with a name and a Password the register function checks if the User already exists and is over 5 and under 200 signs, at the end he either trows back en error or creats the Account in the Database.`

/register\
POST\
braucht: {name: "mindestens 5 Stellig und einmalig", password: ""}\
antwort:
1. Account created
2. Username is too short!
3. Username is to long!
4. User already exists
5. "Error"

### Beispiele
```
Username is too short!
Account created
User already exists
```

---
description: `If feed with the Accounts name and Password the login function checks if said account exists and sends back a Tokken for identification.`\

/login\
POST\
braucht: {name: "", password: "" }\
antwort:
1. [API Key]
2. Invalid wrong user or password

---

description: `Shows Information about a specific game.`

/get_spiel/{spiel_id}\
GET\
antwort:
1. Array mit Spielen

---
description: `Bewegt die Figuren und validiert zug (Ist der Zug erlaubt).`

/mache_move\
POST\
braucht: {KEY: "", spiel_id: "", anfangx: "Zahl", anfangy: "Zahl", endex: "Zahl", endey: "Zahl"}\EE
antwort:
1. Invalid KEY
2. Invalid Game doesn't exist
3. Invalid Move (No figure found)
4. Invalid Move (wrong player)
5. Invalid Move (The coordinates are equal)
6. Invalid Move (Coordinates are not on the field)
7. Success

---

description: `Wenn ein Bauer das Ende des Spielfeldes ereich kann er sich in eine Andere Figur (alle ausser König und Bauer) verwandeln.`

/bauer_zu\
POST\
braucht: {KEY: "", spiel_id: "", anfangx: "Zahl", anfangy: "Zahl", zu: "1= queen, 2=turm..."}\
antwort:
1. Invalid KEY
2. Invalid Game doesn't exist
3. Invalid Move (No figure found)
4. Success
5. Invalid Type
6. Invalid Position

---

description: `Sends TOP 10 (can be changed) Players Username and Win.`

/leaderboard\
GET\
Datatype: Array\
antwort:
1. Username und anzahl Wins Top 10 User (kann bei /leaderboard bei {10} --> "SELECT Username, Wins FROM User ORDER BY Wins DESC LIMIT 10" angepasst werden.)
### Beispiel
```
[{"Username":"lol postman go brrrrrr hello","Wins":3000},
{"Username":"Satgunungg","Wins":99},
{"Username":"Niel","Wins":3},
{"Username":"Niell","Wins":2},
{"Username":"Samuel","Wins":1},
{"Username":"Sa","Wins":0},
{"Username":"samuel","Wins":null}]
```

---

description: `If given a The at Login generated KEY, the live_games_4u API spits out every game that you are the creator of.`

/your_live_games/:KEY\
GET\
special: has parameter (:KEY)\
Antwort:
1. Invalid KEY
2. Array mit: {Game_ID, Player_1, Player_2, aktueller_player, public}
## Beispiel
```
[
    {
        "Games_ID": 1,
        "Player_1": 1,
        "Player_2": 3,
        "aktueller_player": 1,
        "public": null
    },
    {
        "Games_ID": 3,
        "Player_1": 1,
        "Player_2": 1,
        "aktueller_player": 1,
        "public": 1
    }
]
```
---
description: `Creates Game in Database and send back Game ID`

/create_game\
Post\
braucht: {KEY} = Your Tokken, {public} = 0/1 für Public Game oder Private
antwort:
1. Invalid KEY
2. GAME_ID
3. "ERROR"
---
description: ``

/create_game\
Post\
braucht: {KEY} = Your Tokken, {public} = 0/1 für Public Game oder Private
antwort:
1. Invalid KEY
2. GAME_ID
3. "ERROR"
---
description: `Wenn ein Bauer das Ende des Spielfeldes ereich kann er sich in eine Andere Figur (alle ausser König und Bauer) verwandeln.`

/draw\
POST\
braucht: {KEY, spiel_id}\
antwort:
1. Invalid KEY
2. Invalid Game doesn't exist
3. Success
---
## Schachregeln:
- normale Spielregeln (bewegung der Figuren)
- enPassant
- rochade (alle figuren zwischen dem König müssen weg sein und der König oder Turm darf sich noch nicht webegt haben. Geht auch nicht wenn der König im schach steht, oder nach der Rochade im Schach steht.)
- König muss mind. 1 Feld abstand vom anderen König haben
- x Bauern dürfen, wenn sie noch nie bewegt wurden, zwei Felder nach vorne
- x Wenn ein bauer auf die andere seite gelangt, verwandelt er sich in eine belibige Figur
- Wenn nur noch zwei Könige auf dem Feld sind, ist es ein Remis
- Wenn zu wenig Figuren vorhanden sind, ist es ein Remis
- Wenn die gleiche Stellung drei mal wiederholt wird, ist es ein Remis
