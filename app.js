const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'cricketMatchDetails.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

// Get Players API 1
app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT 
      player_id AS playerId,
      player_name AS playerName
    FROM 
      player_details;`
  const playersList = await database.all(getPlayersQuery)
  response.send(playersList)
})

// Get a Specific Player API 2
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
    SELECT 
      player_id AS playerId,
      player_name AS playerName
    FROM 
      player_details
    WHERE player_id = ${playerId};`
  const player = await database.get(getPlayerQuery)
  response.send(player)
})

// Update a Specific Player API 3
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body
  const updatePlayerQuery = `
    UPDATE player_details
    SET player_name = "${playerName}"
    WHERE player_id = ${playerId};`
  const updatePlayer = await database.get(updatePlayerQuery)
  response.send('Player Details Updated')
})

// Get a match details of a specific match API 4
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getMatchesQuery = `
    SELECT 
      match_id AS matchId,
      match,
      year
    FROM 
      match_details
    WHERE match_id = ${matchId};`
  const matchList = await database.get(getMatchesQuery)
  response.send(matchList)
})

// Get the list of all matches of a player API 5
app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const getMatchesOfPlayerQuery = `
    SELECT
    match_details.match_id AS matchId,
    match,
    year
    FROM match_details INNER JOIN player_match_score AS T ON
    match_details.match_id =  T.match_id
    WHERE T.player_id = ${playerId};
    `
  const matchesOfPlayer = await database.all(getMatchesOfPlayerQuery)
  response.send(matchesOfPlayer)
})

// Get the list of all players of a specific match API 6
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getPlayersOfMatchQuery = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName
    FROM player_details INNER JOIN player_match_score AS T ON
    player_details.player_id =  T.player_id
    WHERE T.match_id = ${matchId};
    `
  const playersOfMatch = await database.all(getPlayersOfMatchQuery)
  response.send(playersOfMatch)
})

// Get the player Scores of a particular player API 7
app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const getPlayerScoresQuery = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,

    SUM(T.score) AS totalScore,
    SUM(T.fours) AS totalFours,
    SUM(T.sixes) AS totalSixes

    FROM player_details INNER JOIN player_match_score AS T ON
    player_details.player_id =  T.player_id
    WHERE T.player_id = ${playerId};
    `
  const playerScores = await database.all(getPlayerScoresQuery)
  response.send(playerScores)
})

module.exports = app
