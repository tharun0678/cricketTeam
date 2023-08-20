const express = require("express");
const app = express();
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const intializeAndConnectDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

intializeAndConnectDb();

function convertObjectToResponseObject(object) {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
    jerseyNumber: object.jersey_number,
    role: object.role,
  };
}

//To get All Players Details
app.get("/players/", async (request, response) => {
  const resultQuery = `select * from cricket_team`;
  const getAllPlayers = await db.all(resultQuery);
  response.send(
    getAllPlayers.map((eachPlayer) => {
      return convertObjectToResponseObject(eachPlayer);
    })
  );
});

//to add new player
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addBook = `INSERT INTO cricket_team(player_name, jersey_number, role) VALUES(
      '${playerName}',${jerseyNumber}, '${role}'
  );`;
  await db.run(addBook);
  response.send(`Player Added to Team`);
});

//GET SINGLE PLAYER
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `SELECT * FROM cricket_team where player_id = ${playerId}`;
  const player = await db.get(getPlayer);
  const result = convertObjectToResponseObject(player);
  response.send(result);
});

//update player
app.put("/players/:playerId/", async (request, response) => {
  const playerDetails = request.body;
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updateBook = `UPDATE cricket_team
  set player_name = '${playerName}', jersey_number=${jerseyNumber}, role='${role}'`;
  await db.run(updateBook);
  response.send(`Player Details Updated`);
});

//delete player
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const removingPlayer = `DELETE FROM cricket_team WHERE player_id = ${playerId}`;
  await db.run(removingPlayer);
  response.send(`Player Removed`);
});

module.exports = app;
