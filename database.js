const pg = require('pg')

const dbName = 'vinyl'
const connectionString = process.env.DATABASE_URL || `postgres://localhost:5432/${dbName}`
const client = new pg.Client(connectionString)

client.connect()

// Query helper function
const query = function(sql, variables, callback){
  console.log('QUERY ->', sql.replace(/[\n\s]+/g, ' '), variables)

  client.query(sql, variables, function(error, result){
    if (error){
      console.log('QUERY <- !!ERROR!!')
      console.error(error)
      callback(error)
    }else{
      console.log('QUERY <-', JSON.stringify(result.rows))
      callback(error, result.rows)
    }
  })
}

const getAlbums = function(callback) {
  query("SELECT * FROM albums", [], callback)
}

const getAlbumsByID = function(albumID, callback) {
  query("SELECT * FROM albums WHERE id = $1", [albumID], callback)
}

const User = {
  add: function(credentials, callback) {
    query("INSERT INTO users ( name, email, password ) VALUES ( $1, $2, $3 ) RETURNING *", credentials, callback)
  },

  findByEmail: function(email, callback) {
    query("SELECT * FROM users WHERE email = $1", [email], callback)
  },

  findByID: function(id, callback) {
    query("SELECT * FROM users WHERE id = $1", [id], callback)
  }
}

const Reviews = {
	add: (reviewInfo, callback) => {
		//TODO: Add date_created to query.
		query("INSERT INTO reviews ( content, author_id, album_id ) VALUES ( $1, $2, $3 )", reviewInfo, callback)
	},
	getAll: function(callback) {
		query(
			`SELECT 
			reviews.*, albums.title AS album_title, users.name AS author 
			FROM reviews 
			JOIN albums ON reviews.album_id = albums.id 
			JOIN users ON reviews.author_id = users.id;`,
			[], 
			callback
		)
	},
		
	getByID: function(reviewID, callback) {
		query("SELECT * FROM reviews where id = $1", [reviewID], callback)
	},

	getByAuthorID: function(authorID, callback) {
		query(`SELECT 
			reviews.*, albums.title AS album_title, users.name AS author 
			FROM reviews 
			JOIN albums ON reviews.album_id = albums.id 
			JOIN users ON reviews.author_id = users.id
			WHERE users.id = $1`, [authorID], callback)
	},

	getByAlbumID: function(albumID, callback) {
		query(`SELECT 
			reviews.*, albums.title AS album_title, users.name AS author 
			FROM reviews 
			JOIN albums ON reviews.album_id = albums.id 
			JOIN users ON reviews.author_id = users.id
			WHERE albums.id = $1`, [albumID], callback)
	},

	delete: function(id, callback) {
		query("DELETE from reviews WHERE id = $1", [id], callback)
	},
}

module.exports = {
  getAlbums,
  getAlbumsByID,
  User,
	Reviews
}
