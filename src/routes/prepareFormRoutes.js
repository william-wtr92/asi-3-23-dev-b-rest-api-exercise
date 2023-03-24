import validate from "../middlewares/validate.js"
import {
  idValidator,
  offsetValidator,
  limitValidator,
  formNameValidator,
  orderedFieldsValidator,
} from "../validator.js"
import auth from "../middlewares/auth.js"
import perms from "../middlewares/perms.js"
import FormModel from "../db/models/FormModel.js"
import FieldModel from "../db/models/FieldModel.js"

const prepareFormRoutes = ({ app, db }) => {
  app.post(
    "/create-form",
    auth,
    perms("form", "create"),
    validate({
      body: {
        name: formNameValidator.required(),
        ordered_fields: orderedFieldsValidator.required(),
      },
    }),
    async (req, res) => {
      const { name, ordered_fields } = req.locals.body
      const userCreatorId = req.locals.session.user.id

      const existingFields = await FieldModel.query().whereIn(
        "type",
        ordered_fields
      )
      const fieldType = existingFields.map((field) => field.type)

      await db("forms").insert({
        name,
        ordered_fields: JSON.stringify(fieldType),
        userCreatorId,
      })

      res.send({ result: "Ok" })
    }
  )

  app.get(
    "/forms",
    auth,
    perms("form", "read"),
    validate({
      query: {
        offset: offsetValidator,
        limit: limitValidator,
      },
    }),
    async (req, res) => {
      const { offset, limit } = req.locals.query

      const forms = await FormModel.query().limit(limit).offset(offset)

      const totalCount = await FormModel.query().count("* as total").first()

      res.send({
        data: forms,
        meta: {
          totalCount: parseInt(totalCount.total, 10),
        },
      })
    }
  )

  app.get(
    "/forms/:formId",
    auth,
    perms("form", "read"),
    validate({
      params: {
        formId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const { formId } = req.locals.params
      const form = await FormModel.query().findById(formId)

      if (!form) {
        res.status(404).send({ error: "Not found !" })

        return
      }

      res.send({ data: form })
    }
  )

  app.patch(
    "/forms/:formId",
    auth,
    perms("form", "update"),
    validate({
      params: {
        formId: idValidator.required(),
      },
      body: {
        name: formNameValidator.notRequired(),
        ordered_fields: orderedFieldsValidator.notRequired(),
      },
    }),
    async (req, res) => {
      const { name, ordered_fields } = req.locals.body
      const { formId } = req.locals.params

      const form = await FormModel.query().findById(formId)

      if (!form) {
        res.status(404).send({ error: "Not found !" })

        return
      }

      const updates = {
        ...(name ? { name } : {}),
      }

      if (ordered_fields) {
        const existingFields = await FieldModel.query().whereIn(
          "type",
          ordered_fields
        )
        const fieldType = existingFields.map((field) => field.type)
        updates.ordered_fields = JSON.stringify(fieldType)
      }

      await FormModel.query().update(updates).where({
        id: formId,
      })

      const updatedForm = await FormModel.query().findById(formId)

      res.send({ data: updatedForm })
    }
  )

  app.delete(
    "/forms/:formId",
    auth,
    perms("form", "delete"),
    validate({
      params: {
        formId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const { formId } = req.locals.params
      const form = await FormModel.query().findById(formId)

      if (!form) {
        res.status(404).send({ error: "Not found !" })

        return
      }

      await FormModel.query().delete().where({
        id: formId,
      })

      res.send({ data: form })
    }
  )
}

export default prepareFormRoutes
