var expressApp = require('express')
import express from 'express'
import path from 'path'
import ExpressOAuthServer from 'express-oauth-server'
import {AuthorizationCode, Client, User, Token, RefreshToken, OAuthError} from 'oauth2-server'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import csrf from 'csurf'


const app = expressApp()
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(cookieParser())
// TODO: Any key besides _csrf does not seem to work and generates an invalid csrf error on post.
const csrfProtection = csrf({cookie: {key: '_csrf'}})

class ValidationError extends Error {}
class RegistrationVerificationError extends Error {}

const getFooHandler = (req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.log('Running GET:/foo ...')

  const query_string = 'foo=abc&bar=xzy123'

  res.render(
    'foo',
    {
      queryString: query_string,
      csrfToken: req.csrfToken(),
    }
  )
}

const postFooHandler = (req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.log('Running POST:/foo ...')

  res.render('Success')
}

const errorHandler = async (error: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error) {
    console.log('Error', error)

    let status_code = 500
    let error_message = "An error occurred."
    if (
      error instanceof ValidationError ||
      error instanceof RegistrationVerificationError
    ) {
      status_code = 400
      error_message = error.message
    } else if (error.name === 'ForbiddenError') {
      // TODO: Can instanceof be used instead of comparing name?
      status_code = 403
      error_message = error.message
    }

    res.status(status_code)
    .render(
      'error',
      {
        message: error_message,
      }
    )
  } else {
    next()
  }
}

app.listen(8080, () => {
  console.log('Running server at port 8080...')
})

// Endpoints
app.get('/foo', csrfProtection, getFooHandler)
app.post('/foo', csrfProtection, postFooHandler)

app.use(errorHandler)
