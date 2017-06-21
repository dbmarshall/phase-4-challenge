const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcrypt-nodejs')
const database = require('../database')

const isAuthenticated = (request, response, next) => {
    if ( !request.user ) {
        request.flash('You must be logged in for that.')
        response.redirect('/')
    } else {
        return next()
    }
}

router.get('/', (request, response) => {
  let user = request.user ? request.user[0] : null
  response.render('splash', {user: user})
})

router.get('/login', (request, response) => {
  let user = request.user ? request.user[0] : null
	if (user) {
		response.redirect('/users/' + user.id)
	} else {
  	response.render('login', {user: user})
	}
})

router.post('/login', passport.authenticate('local', {
		failureRedirect: '/login',
		failureFlash: true
	}),
	(request, response) => 
		response.redirect('/home/profile')
)

router.get('/logout', isAuthenticated, (request, response) => {
  request.logout()
  response.redirect('/login')
})

router.get('/signup', (request, response) => {
	let user = request.user ? request.user : null
	if (user) {
		request.flash('info', "You're already logged in!")
		response.redirect('/users/' + user[0].id)
	}
    response.render('signup', {user: null})
	})

router.post('/signup', (request, response) => {
  let {username, useremail, userpassword} = request.body
  let pass_hash = bcrypt.hashSync(userpassword)
  let signup_date = Date.now()
  let credentials = [username, useremail, pass_hash]
  database.User.add(credentials, (error) => {
    if (error) {
			request.flash("error", "An account with that email already exists.")
      response.render('signup', {user: null})
    } else {
      response.redirect('/login')  
    }
  })
})

router.get('/home', isAuthenticated, (request, response) => {
  let user = request.user[0]
  database.getAlbums((error, albums) => {
    if (error) {
      response.status(500).render('error', { error: error })
    } else {
			database.Reviews.getAll((error, reviews) => {
				let latestReviews = reviews.slice(reviews.length-3)
      	response.render('home', {albums: albums, reviews: latestReviews, user: user})
			})
    }
  })
})

router.get('/albums/:albumID', isAuthenticated, (request, response) => {
  const albumID = request.params.albumID
  let user = request.user[0]
  database.getAlbumsByID(albumID, (error, albums) => {
    if (error) {
      response.status(500).render('error', { error: error, user: user })
    } else {
      const album = albums[0]
			database.Reviews.getByAlbumID(album.id, (error, reviews) => {
				if (error) {
      		response.status(500).render('error', { error: error, user: user })
				} else {
	      	response.render('album', {album: album, reviews: reviews, user: user})
				}
			})
    }
  })
})

router.get('/albums/:albumID/submit_review', isAuthenticated, (request, response) => {
	let {albumID} = request.params
	let user = request.user[0]
	database.getAlbumsByID(albumID, (error, albums) => {
		if (error) {
			response.status(500).render('error', {error: error, user: user})
		} else {
			const album = albums[0]
			response.render('add_review', {album: album, user: user})
		}
	})
})

router.post('/review', isAuthenticated, (request, response) => {
	let {content, albumID} = request.body
	if (content.length < 1) {
		request.flash('info', 'Review can not be empty.')
		response.redirect('/albums/' + albumID + '/submit_review')
	} else {
		let authorID = request.user[0].id
		let reviewInfo = [ content, authorID, albumID ]
		database.Reviews.add( reviewInfo, (error) => {
			if (error) {
				response.status(500).render('error', {error: error, user: request.user[0]})
			} else {
				response.redirect('/albums/' + albumID)
			}
		})
	}
})

router.delete('/review', isAuthenticated, (request, response) => {
	let { id } = request.body
	database.Reviews.delete(id, (error) => {
		if (error) {
			response.status(500).render('error', {error: error, user: request.user[0]})
		} else {
			response.sendStatus(200)
		}
	})

})

router.get('/home/profile', isAuthenticated, (request, response) => {
	let user = request.user[0]
	database.Reviews.getByAuthorID(user.id, (error, reviews) => {
		if (error) {
			response.status(500).render('error', {error: error, user: request.user[0]})
		} else {
			response.render('user_profile', {reviews: reviews, user: request.user[0]})
		}
	})
})

router.get('/users/:userID', (request, response) => {
	let {userID} = request.params
	database.User.findByID(userID, (error, user) => {
		if (error) {
			response.status(500).render('error', {error: error, user: request.user ? request.user[0] : null})
		} else {
			database.Reviews.getByAuthorID(user[0].id, (error, reviews) => {
				if (error) {
			response.status(500).render('error', {error: error, user: request.user ? request.user[0] : null})
		} else {
  			response.render('user_profile', {reviews: reviews, user: user[0]})
		}
			})
		}
	})
})

module.exports = router