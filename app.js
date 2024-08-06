const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()

app.use(express.json())

let db = null

const dbPath = path.join(__dirname, 'moviesData.db')

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const objectToResponse = object => {
  return {
    movieId: object.movie_id,
    directorId: object.director_id,
    movieName: object.movie_name,
    leadActor: object.lead_actor,
    directorName: object.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const getMovieQuery = `
    SELECT movie_name
    FROM movie
    ORDER BY movie_id`

  const movieArray = await db.all(getMovieQuery)
  response.send(movieArray.map(movie => objectToResponse(movie)))
})

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const getMovieQuery = `
    INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES(${directorId},'${movieName}','${leadActor}');`

  const movieArray = await db.run(getMovieQuery)
  const movieId = movieArray.lastId
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
    SELECT *
    FROM movie
    WHERE movie_id=${movieId}`
  const movieArray = await db.get(getMovieQuery)
  response.send(objectToResponse(movieArray))
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const getMovieQuery = `
    UPDATE movie
    SET 
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE movie_id=${movieId};
    `

  const movieArray = await db.run(getMovieQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getBookQuery = `
    DELETE FROM movie
    WHERE movie_id=${movieId};
    `
  const movieArray = await db.run(getBookQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getDirectorQuery = `
    SELECT *
    FROM director
    ORDER BY director_id`

  const DirectorArray = await db.all(getDirectorQuery)
  response.send(DirectorArray.map(director => objectToResponse(director)))
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorQuery = `
    SELECT movie_name
    FROM movie
    WHERE director_id=${directorId}`

  const DirectorArray = await db.all(getDirectorQuery)
  response.send(DirectorArray.map(director => objectToResponse(director)))
})

module.exports = app
