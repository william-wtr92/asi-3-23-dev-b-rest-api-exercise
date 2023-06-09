import hashPassword from "../db/hashPassword.js"
import UserModel from "../db/models/UserModel.js"
import PageModel from "../db/models/PageModel.js"
import validate from "../middlewares/validate.js"
import {
  firstNameValidator,
  lastNameValidator,
  emailValidator,
  passwordValidator,
  roleIdValidator,
  offsetValidator,
  limitValidator,
  idValidator,
} from "../validator.js"
import auth from "../middlewares/auth.js"
import perms from "../middlewares/perms.js"

const prepareUserRoutes = ({ app, db }) => {
  app.post(
    "/user-register",
    auth,
    perms("users", "create"),
    validate({
      body: {
        firstName: firstNameValidator.required(),
        lastName: lastNameValidator.required(),
        email: emailValidator.required(),
        password: passwordValidator.required(),
        roleId: roleIdValidator.required(),
      },
    }),
    async (req, res) => {
      const { firstName, lastName, email, password, roleId } = req.locals.body
      const validateUserMail = await UserModel.query().findOne({ email })

      if (validateUserMail) {
        res.status(401).send({ error: "Invalid credentials !" })

        return
      }

      const [passwordHash, passwordSalt] = await hashPassword(password)

      await db("users").insert({
        firstName,
        lastName,
        email,
        passwordHash,
        passwordSalt,
        roleId,
      })

      res.send({ result: "Ok" })
    }
  )

  app.get(
    "/users",
    auth,
    perms("users", "read"),
    validate({
      query: {
        offset: offsetValidator,
        limit: limitValidator,
      },
    }),
    async (req, res) => {
      const { offset, limit } = req.locals.query
      const users = await UserModel.query().limit(limit).offset(offset)
      const totalCount = await UserModel.query().count("* as total").first()

      res.send({
        data: users,
        meta: {
          totalCount: parseInt(totalCount.total, 10),
        },
      })
    }
  )

  app.get(
    "/users/:userId",
    auth,
    perms("users", "read", true),
    validate({
      params: {
        userId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const { userId } = req.locals.params
      const user = await UserModel.query().findById(userId)

      if (!user) {
        res.status(404).send({ error: "Not found !" })

        return
      }

      res.send({ data: user })
    }
  )

  app.patch(
    "/users/:userId",
    auth,
    perms("users", "update", true),
    validate({
      params: {
        userId: idValidator.required(),
      },
      body: {
        firstName: firstNameValidator.required(),
        lastName: lastNameValidator.required(),
        email: emailValidator.required(),
      },
    }),
    async (req, res) => {
      const { firstName, lastName, email } = req.locals.body
      const { userId } = req.locals.params
      const user = await UserModel.query().findById(userId)

      if (!user) {
        res.status(404).send({ error: "Not found !" })

        return
      }

      const updatedUser = await UserModel.query()
        .update({
          ...(firstName ? { firstName } : {}),
          ...(lastName ? { lastName } : {}),
          ...(email ? { email } : {}),
        })
        .where({
          id: userId,
        })
        .returning("*")

      res.send({ data: updatedUser })
    }
  )

  app.delete(
    "/users/:userId",
    auth,
    perms("users", "delete"),
    validate({
      params: {
        userId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const { userId } = req.locals.params
      const user = await UserModel.query().findById(userId)

      if (!user) {
        res.status(404).send({ error: "Not found !" })

        return
      }

      await PageModel.query().delete().where({
        userCreatorId: userId,
      })

      await UserModel.query().delete().where({
        id: userId,
      })

      res.send({ data: user })
    }
  )
}

export default prepareUserRoutes
