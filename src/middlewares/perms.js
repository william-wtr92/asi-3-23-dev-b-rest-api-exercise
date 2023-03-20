import UserModel from "../db/models/UserModel.js"

const perms = (permission, method) => async (req, res, next) => {
  const user = await UserModel.query()
    .findById(req.locals.session.user.id)
    .withGraphFetched("role")
  const rolePermissions = user.role.permissions

  if (!rolePermissions[permission] || !rolePermissions[permission][method]) {
    res.status(403).send({ error: "Forbidden !" })

    return
  }

  next()
}

export default perms
