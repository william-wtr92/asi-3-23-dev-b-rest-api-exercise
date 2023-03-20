import NavigationMenuModel from "../db/models/NavigationMenuModel.js"
import validate from "../middlewares/validate.js"
import {
  idValidator,
  offsetValidator,
  limitValidator,
  menuNameValidator,
} from "../validator.js"
import auth from "../middlewares/auth.js"
import perms from "../middlewares/perms.js"

const prepareNavigationMenuRoutes = ({ app, db }) => {
  app.post(
    "/create-menu",
    auth,
    perms("navmenu", "create"),
    validate({
      body: {
        name: menuNameValidator.required(),
        parentId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const { name, parentId } = req.locals.body

      await db("navigation_menu").insert({
        name,
        parentId,
      })

      res.send({ result: "Ok" })
    }
  )

  app.get(
    "/navigation-menu",
    auth,
    perms("navmenu", "read"),
    validate({
      query: {
        offset: offsetValidator.required(),
        limit: limitValidator.required(),
      },
    }),
    async (req, res) => {
      const { offset, limit } = req.locals.query

      const navMenu = await NavigationMenuModel.query()
        .limit(limit)
        .offset(offset)

      res.send({ data: navMenu })
    }
  )

  app.get(
    "/navigation-menu/:navId",
    auth,
    perms("navmenu", "read"),
    validate({
      params: {
        navId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const { navId } = req.locals.params
      const navMenu = await NavigationMenuModel.query().findById(navId)

      if (!navMenu) {
        res.status(404).send({ error: "Not found !" })

        return
      }

      res.send({ data: navMenu })
    }
  )

  app.patch(
    "/navigation-menu/:navId",
    auth,
    perms("navmenu", "update"),
    validate({
      params: {
        navId: idValidator.required(),
      },
      body: {
        name: menuNameValidator.required(),
        parentId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const { name, parentId } = req.locals.body
      const { navId } = req.locals.params

      const navMenu = await NavigationMenuModel.query().findById(navId)

      if (!navMenu) {
        res.status(404).send({ error: "Not found !" })

        return
      }

      const updatedNavMenu = await NavigationMenuModel.query()
        .update({
          ...(name ? { name } : {}),
          ...(parentId ? { parentId } : {}),
        })
        .where({
          id: navId,
        })
        .returning("*")

      res.send({ data: updatedNavMenu })
    }
  )

  app.delete(
    "/navigation-menu/:navId",
    auth,
    perms("navmenu", "delete"),
    validate({
      params: {
        navId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const { navId } = req.locals.params
      const navMenu = await NavigationMenuModel.query().findById(navId)

      if (!navMenu) {
        res.status(404).send({ error: "Not found !" })

        return
      }

      await NavigationMenuModel.query().delete().where({
        id: navId,
      })

      res.send({ data: navMenu })
    }
  )
}

export default prepareNavigationMenuRoutes
