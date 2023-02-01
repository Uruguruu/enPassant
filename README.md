# enPassant
Project repository for a Chess Game made in two weeks.

## functionen

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
