const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcrypt-nodejs')
const database = require('../database')

const isAuthenticated = (request, response, next) => {
    if ( !request.user ) {
        request.flash('You must be logged in for that.')
        response.redirect('/login')
    } else {
        return next()
    }
}

router.get('/', (request, response) => {
    response.render('splash')
})

router.get('/login', (request, response) => {
  response.render('login')
})

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }),
  (request, response) => 
    response.redirect('/users/' + request.user.id)
)

router.get('/logout', isAuthenticated, (request, response) => {
  request.logout()
  response.redirect('/login')
})

router.get('/signup', (request, response) => 
    response.render('signup'))

router.post('/signup', (request, response) => {
  let {username, useremail, userpassword} = request.body
  let pass_hash = bcrypt.hashSync(userpassword)
  let signup_date = Date.now()
  let credentials = [username, useremail, pass_hash]
  database.User.add(credentials, (error) => {
    if (error) {
        request.flash("error", "An account with that email already exists.")
      response.render('signup')
    } else {
      response.redirect('/login')  
    }
  })
})

router.get('/home', isAuthenticated, (request, response) => {
  let user
  if (request.user) {
    user = request.user[0]
  } else {
    user = null
  }
  database.getAlbums((error, albums) => {
    if (error) {
      response.status(500).render('error', { error: error })
    } else {
      response.render('home', { albums: albums, user: user })
    }
  })
})

router.get('/albums/:albumID', isAuthenticated, (request, response) => {
  const albumID = request.params.albumID

  database.getAlbumsByID(albumID, (error, albums) => {
    if (error) {
      response.status(500).render('error', { error: error })
    } else {
      const album = albums[0]
      response.render('album', { album: album })
    }
  })
})

router.get('/users/:userID', isAuthenticated, (request, response) => {
    console.log( request.user )
  response.render('user_profile', {user: request.user[0]} )
})

module.exports = router