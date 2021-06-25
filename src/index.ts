var expressApp = require('express')
import express from 'express'
import OAuthServer from 'express-oauth-server'
import {AuthorizationCode, Client, User} from 'oauth2-server'


const app = expressApp()

app.oauth = new OAuthServer({
  model: {
    getClient: async (clientId: string, clientSecret: string) => {
      console.log('Reached getClient')
      
      if (clientId !== '1234')
        return null
      if (clientSecret && clientSecret !== 'abcd')
        return null

      return {
        id: clientId,
        redirectUris: ["http://localhost:4000", "http://localhost:5000"],
        grants: ["authorization_code", "refresh_token"],
        accessTokenLifetime: 3600 * 24, // 1 day
        refreshTokenLifetime: 3600 * 24 * 30, // 30 days
      }
    },
    saveAuthorizationCode: async (code: AuthorizationCode, client: Client, user: User) => {
      console.log('Reached saveAuthorizationCode')
      
      return {
        authorizationCode: code.authorizationCode,
        expiresAt: code.expiresAt,
        redirectUri: code.redirectUri,
        scope: code.scope,
        client: client,
        user: user,
      }
    },
    getAccessToken: async (accessTokenKey: string) => {
      console.log('Reached getAccessToken')
      
      if (accessTokenKey.startsWith('XYZ'))
        return null

      const expiry_date = new Date()
      expiry_date.setHours(expiry_date.getHours() + 1)

      return {
        accessToken: accessTokenKey,
        accessTokenExpiresAt: expiry_date,
        scope: ["email", "profile", "openid"],
        client: {
          id: '1234',
          redirectUris: ["http://localhost:4000", "http://localhost:5000"],
          grants: ["authorization_code", "refresh_token"],
          accessTokenLifetime: 3600 * 24, // 1 day
          efreshTokenLifetime: 3600 * 24 * 30, // 30 days
        },
        user: {
          id: 234567,
          email: 'foo@bar.com',
        },
      }
    },
  } as any, // Just to avoid TS errors.
  //continueMiddleware: true,
})

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use(app.oauth.authorize())  // Commenting this link obviously makes /public accessible.
// TODO: Access this page without getting a 401, while also using the oauth middleware.
app.get('/public', function(req: any, res: any) {
  console.log('Reached /public')
  res.send('Public area');
})

const port = 8080
app.listen(port, () => {
  console.log('Running server at port ' + port + '...')
})
