import jsonwebtoken from "jsonwebtoken"
import config from "../config.js"
import hashPassword from "../db/hashPassword.js"
import validate from "../middlewares/validate.js"
import {
  emailValidator,
  stringValidator,
} from "../validator.js"

const prepareSignInRoutes = ({ app, db }) => {
  app.post(
    "/sign-in",
    validate({
      body: {
        email: emailValidator.required(),
        password: stringValidator.required(),
      },
    }),
    async (req, res) => {
      const { email, password } = req.locals.body
      const [user] = await db("users").where({ email })

      if (!user) {
        res.status(401).send({ error: "Invalid credentials." })

        return
      }

      const [passwordHash] = await hashPassword(password, user.passwordSalt)

      if (passwordHash !== user.passwordHash) {
        res.status(401).send({ error: "Invalid credentials." })

        return
      }

      const jwt = jsonwebtoken.sign(
        {
          payload: {
            user: {
              id: user.id,
            },
          },
        },
        config.security.jwt.secret,
        config.security.jwt.options
      )

      res.send({ result: jwt })
    }
  )
}

export default prepareSignInRoutes
