# enPassant
Project repository for a Chess Game made in two weeks.

## Funktionen

##### Wir haben ein Login bei der sich der User Registrieren und danach Anmelden kann. Er bekommt dann auch einen Key mit dem er dann sich autentifiziert.

##### Danach kommt eine Übersicht von allen angefangenen Spielen, die man dann öffnen kann und weiterspielen kann wenn man am Zug ist

##### Man kann auch ein neues Spiel erstellen. Dabei gibt es 2 Varianten
1. Man macht es lokal und  spielt gegen sich selbst (optional)
2. Man erstelt online ein Spiel und man kriegt dann einen Spiel Code den man dann bei jemandem anders eingeben kann und somit gegeneinander Schach spielt

##### Wir haben ein Schachbrett das mit drag and drop funktioniert

##### Sobald jemand ein Zug macht wird eine request an das Backend gesendet und dieses überprüft dann, ob der Spieler am Zug ist und ob der Spielzug auch möglich ist. Das frontend aktualisiert danach das Spielfeld

## API

/register
POST
braucht: {name: "mindestens 5 Stellig und einmalig", password: ""}
antwort: 
1. erfolgreich user erstellt
2. fehler nicht erstellt

/login
POST
braucht: {name: "", password: "" }
antwort:
1. [API Key]
2. login Daten falsch

/get_angefangene_spiele?{API Key}
GET
antwort:
1. {}
2. API Key abgelaufen

/get_spiel?{spiel_id}
GET
antwort:
1. {}
2. ungultige spiel_id

/mache_move
POST
braucht: {KEY: "", spiel_id: "", anfangx: "Zahl", anfangy: "Zahl", endex: "Zahl", endey: "Zahl"}
antwort:
1. Zug gemacht
2. ungültiger Zug
3. ungültige spiel_id
4. ungültiger KEY

/bauer_zu
POST
braucht: {KEY: "", spiel_id: "", anfangx: "Zahl", anfangy: "Zahl", zu: "1= queen, 2=turm..."}
antwort:
1. Zug gemacht
2. ungültiger Zug
3. ungültige spiel_id
4. ungültiger KEY
## Schachregeln:
- normale Spielregeln (bewegung der Figuren)
- enPassant
- rochade (alle figuren zwischen dem König müssen weg sein und der König oder Turm darf sich noch nicht webegt haben. Geht auch nicht wenn der König im schach steht, oder nach der Rochade im Schach steht.)
- König muss mind. 1 Feld abstand vom anderen König haben
- Bauern dürfen, wenn sie noch nie bewegt wurden, zwei Felder nach vorne
- Wenn ein bauer auf die andere seite gelangt, verwandelt er sich in eine belibige Figur
- Wenn nur noch zwei Könige auf dem Feld sind, ist es ein Remis
- Wenn zu wenig Figuren vorhanden sind, ist es ein Remis
- Wenn die gleiche Stellung drei mal wiederholt wird, ist es ein Remis
