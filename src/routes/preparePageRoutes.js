import PageModel from "../db/models/PageModel.js"
import validate from "../middlewares/validate.js"
import {
  titleValidator,
  contentValidator,
  idValidator,
  offsetValidator,
  limitValidator,
  statusValidator,
} from "../validator.js"
import auth from "../middlewares/auth.js"
import perms from "../middlewares/perms.js"

const preparePageRoutes = ({ app, db }) => {
  app.post(
    "/create-page",
    auth,
    perms("pages", "create"),
    validate({
      body: {
        title: titleValidator.required(),
        content: contentValidator.required(),
        status: statusValidator.required(),
      },
    }),
    async (req, res) => {
      const { title, content, status = "draft" } = req.locals.body
      const userCreatorId = req.locals.session.user.id

      const urlSlug = title.toLowerCase().replace(/\s+/g, "-")

      const validateUrlSlug = await PageModel.query().findOne({ urlSlug })

      if (validateUrlSlug) {
        res.status(401).send({ error: "Invalid urlSlug ! " })

        return
      }

      await db("pages").insert({
        title,
        content,
        urlSlug,
        userCreatorId,
        status,
      })

      res.send({ result: "Ok" })
    }
  )

  app.get(
    "/pages/published",
    auth,
    perms("pages", "read"),
    validate({
      query: {
        offset: offsetValidator.required(),
        limit: limitValidator.required(),
      },
    }),
    async (req, res) => {
      const { offset, limit } = req.locals.query

      const pages = await PageModel.query()
        .where("status", "published")
        .limit(limit)
        .offset(offset)

      res.send({ data: pages })
    }
  )

  app.get(
    "/pages/draft",
    auth,
    perms("pages", "read"),
    validate({
      query: {
        offset: offsetValidator.required(),
        limit: limitValidator.required(),
      },
    }),
    async (req, res) => {
      const { offset, limit } = req.locals.query

      const pages = await PageModel.query()
        .where("status", "draft")
        .limit(limit)
        .offset(offset)

      res.send({ data: pages })
    }
  )

  app.get(
    "/pages/:pageId",
    auth,
    perms("pages", "read"),
    validate({
      params: {
        pageId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const { pageId } = req.locals.params
      const page = await PageModel.query().findById(pageId)

      if (!page) {
        res.status(404).send({ error: "Not found !" })

        return
      }

      res.send({ data: page })
    }
  )

  app.patch(
    "/pages/:pageId",
    auth,
    perms("pages", "update"),
    validate({
      params: {
        pageId: idValidator.required(),
      },
      body: {
        title: titleValidator.required(),
        content: contentValidator.required(),
      },
    }),
    async (req, res) => {
      const { title, content } = req.locals.body
      const { pageId } = req.locals.params
      const { userId } = req.locals.session.user.id

      const page = await PageModel.query().findById(pageId)

      if (!page) {
        res.status(404).send({ error: "Not found !" })

        return
      }

      const userUpdateId = [...page.userUpdateId, userId]

      const updatedPage = await PageModel.query()
        .update({
          ...(title ? { title } : {}),
          ...(content ? { content } : {}),
          ...(userUpdateId
            ? { userUpdateId: JSON.stringify(userUpdateId) }
            : {}),
        })
        .where({
          id: pageId,
        })
        .returning("*")

      res.send({ data: updatedPage })
    }
  )

  app.delete(
    "/pages/:pageId",
    auth,
    perms("pages", "delete"),
    validate({
      params: {
        pageId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const { pageId } = req.locals.params
      const page = await PageModel.query().findById(pageId)

      if (!page) {
        res.status(404).send({ error: "Not found !" })

        return
      }

      await PageModel.query().delete().where({
        id: pageId,
      })

      res.send({ data: page })
    }
  )
}

export default preparePageRoutes
