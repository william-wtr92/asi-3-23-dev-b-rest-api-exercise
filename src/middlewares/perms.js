import PageModel from "../db/models/PageModel.js"
import UserModel from "../db/models/UserModel.js"

const perms =
  (permission, method, override = false) =>
  async (req, res, next) => {
    const user = await UserModel.query()
      .findById(req.locals.session.user.id)
      .withGraphFetched("role")
    const rolePermissions = user.role.permissions

    if (typeof req.params.pageId === "undefined") {
      next()

      return
    }

    const page = await PageModel.query().findById(parseInt(req.params.pageId))

    if (
      override &&
      req.locals.session.user.id === parseInt(req.params.userId)
    ) {
      next()

      return
    }

    if (override && page.userCreatorId === req.locals.session.user.id) {
      next()

      return
    }

    if (!rolePermissions[permission] || !rolePermissions[permission][method]) {
      res.status(403).send({ error: "Forbidden !" })

      return
    }

    next()
  }

export default perms
