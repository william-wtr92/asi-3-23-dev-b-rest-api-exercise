import jsonwebtoken from "jsonwebtoken"
import config from "../config.js"

const auth = (req, res, next) => {
  const jwt = req.headers.authorization?.slice(7)

  try {
    const { payload } = jsonwebtoken.verify(jwt, config.security.jwt.secret)
    req.locals.session = payload

    next()
  } catch (err) {
    if (err instanceof jsonwebtoken.JsonWebTokenError) {
      res.status(403).send({ error: "Forbidden" })

      return
    }

    res.status(500).send({ error: "Oops. Something went wrong." })
  }
}

export default auth
