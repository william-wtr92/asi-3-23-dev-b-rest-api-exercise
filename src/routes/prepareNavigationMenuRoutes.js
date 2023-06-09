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
import PageModel from "../db/models/PageModel.js"

const prepareNavigationMenuRoutes = ({ app, db }) => {
  app.post(
    "/create-menu",
    auth,
    perms("navmenu", "create"),
    validate({
      body: {
        name: menuNameValidator.required(),
        parentId: idValidator,
        pageId: idValidator,
      },
    }),
    async (req, res) => {
      const { name, parentId, pageId } = req.locals.body

      if (parentId) {
        const validateParentId = await NavigationMenuModel.query().findOne({
          id: parentId,
        })

        if (!validateParentId) {
          res.status(401).send({ error: "ParentId not found !" })

          return
        }
      }

      const validatePageId = await PageModel.query().findById(pageId)

      if (!validatePageId) {
        res.status(401).send({ error: "PageId not found !" })

        return
      }

      await db("navigation_menu").insert({
        name,
        parentId,
        pageId,
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
        offset: offsetValidator,
        limit: limitValidator,
      },
    }),
    async (req, res) => {
      const { offset, limit } = req.locals.query

      const navMenu = await NavigationMenuModel.query()
        .limit(limit)
        .offset(offset)

      const totalCount = await NavigationMenuModel.query()
        .count("* as total")
        .first()

      res.send({
        data: navMenu,
        meta: {
          totalCount: parseInt(totalCount.total, 10),
        },
      })
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
      const navMenu = await NavigationMenuModel.query()
        .findById(navId)
        .withGraphFetched("children.^")

      if (!navMenu) {
        res.status(404).send({ error: "Not found !" })

        return
      }

      const buildTree = (menu) => {
        return {
          ...menu,
          children: menu.children.map(buildTree),
        }
      }

      const tree = buildTree(navMenu)

      res.send({ data: tree })
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
        pageId: idValidator,
      },
    }),
    async (req, res) => {
      const { name, parentId, pageId } = req.locals.body
      const { navId } = req.locals.params

      const validateParentId = await NavigationMenuModel.query().findById(
        parentId
      )

      const validatePageId = pageId
        ? await PageModel.query().findById(pageId)
        : null

      if (!validateParentId) {
        res.status(401).send({ error: "ParentId not found!" })

        return
      }

      if (pageId && !validatePageId) {
        res.status(401).send({ error: "PageId not found!" })

        return
      }

      const navMenu = await NavigationMenuModel.query().findById(navId)

      if (!navMenu) {
        res.status(404).send({ error: "Not found!" })

        return
      }

      const updatedNavMenu = await NavigationMenuModel.query()
        .update({
          ...(name ? { name } : {}),
          ...(parentId ? { parentId } : {}),
          ...(pageId ? { pageId } : {}),
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
