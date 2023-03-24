import UserModel from "../db/models/UserModel.js"
import PageModel from "../db/models/PageModel.js"

const perms =
  (permission, method, override = false) =>
  async (req, res, next) => {
    const user = await UserModel.query()
      .findById(req.locals.session.user.id)
      .withGraphFetched("role")
    const rolePermissions = user.role.permissions

    const pageId = parseInt(req.params.pageId)
    const userId = parseInt(req.params.userId)

    if (typeof req.params.pageId !== "undefined") {
      const page = await PageModel.query().findById(pageId)

      if (
        override &&
        (req.locals.session.user.id === userId ||
          page.userCreatorId === req.locals.session.user.id)
      ) {
        next()

        return
      }
    }

    if (
      typeof req.params.userId !== "undefined" &&
      override &&
      req.locals.session.user.id === userId
    ) {
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
