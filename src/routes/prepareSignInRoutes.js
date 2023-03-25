import jsonwebtoken from "jsonwebtoken"
import config from "../config.js"
import hashPassword from "../db/hashPassword.js"
import validate from "../middlewares/validate.js"
import {
  emailValidator,
  passwordValidator,
  stringValidator,
  tokenValidator,
} from "../validator.js"
import UserModel from "../db/models/UserModel.js"
import auth from "../middlewares/auth.js"
import sgMail from "@sendgrid/mail"

const prepareSignInRoutes = ({ app, db }) => {
  sgMail.setApiKey(config.sendgrid.apiKey)

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

  app.post(
    "/reset-password",
    auth,
    validate({
      body: {
        email: emailValidator.required(),
      },
    }),
    async (req, res) => {
      const { email } = req.locals.body
      const user = await UserModel.query().findOne({ email })

      if (!user) {
        res.status(404).send({ error: "Not Found !" })

        return
      }

      const resetToken = jsonwebtoken.sign(
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

      const resetUrl = `https://localhost:3000/reset-password?token=${resetToken}`

      const msg = {
        to: email,
        from: "william.wautrin@supdevinci-edu.fr",
        subject: "Reset Password",
        text: `Click on the link below to reset your password: ${resetUrl}`,
        html: `<p>Click on the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
      }

      await sgMail
        .send(msg)
        .then(() => {
          res.send({ message: "Password reset email sent" })
        })
        .catch((error) => {
          res.status(500).send({ result: error })
        })
    }
  )

  app.post(
    "/reset-password/confirm",
    validate({
      body: {
        email: emailValidator.required(),
        newPassword: passwordValidator.required(),
        token: tokenValidator.required(),
      },
    }),
    async (req, res) => {
      const { token, newPassword } = req.locals.body

      const {
        payload: {
          user: { id: userId },
        },
      } = jsonwebtoken.verify(token, config.security.jwt.secret)

      const [hashedPassword, passwordSalt] = await hashPassword(newPassword)

      await UserModel.query()
        .update({ passwordHash: hashedPassword, passwordSalt: passwordSalt })
        .where({ id: userId })

      res.send({ result: "Password reset successfully" })
    }
  )
}

export default prepareSignInRoutes
