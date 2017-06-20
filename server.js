const express = require('express')
const session = require('express-session')
const flash = require('connect-flash')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt-nodejs')
const database = require('./database')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const app = express()

const routes = require('./routes')

app.use(session({
  secret: 'steez',
  resave: false,
  saveUninitialized: true,
  cookie: {maxAge: 60000}
}))
app.use(passport.initialize())
app.use(passport.session())

require('ejs')
app.set('view engine', 'ejs');
app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(flash())
app.use(function( request, response, next) {
  response.locals.messages = require('express-messages')(request, response)
  next()
})

app.use(routes)


passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},  
  function(email, password, done) {
    database.User.findByEmail(email, (error, user) => {
      user = user[0]
      if (error) { return done(error) }
      if (!user) { return done(null, false, {message: 'Email not found.'})}
      if ( !bcrypt.compareSync(password, user.password) ) {
        return done(null, false, {message: 'Invalid password.'})
      }
      return done(null, user)
    })
  }
))

passport.serializeUser(function(user, done) {
  done(null, user.id)
})
passport.deserializeUser(function(id, done) {
  database.User.findById(id, function(error, user) {
    done(null, user)
  })
})

app.use((request, response) => {
  response.status(404).render('not_found')
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}...`)
})
