import validate from "../middlewares/validate.js"
import {
  idValidator,
  offsetValidator,
  limitValidator,
  formNameValidator,
  orderedFieldsValidator,
  defaultValueValidator,
  optionsValidator,
  labelValidator,
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

      const orderedFieldsData = ordered_fields.map((field) => {
        return {
          ...(field.fieldId ? { fieldId: field.fieldId } : {}),
          ...(field.defaultValue
            ? { defaultValue: field.defaultValue }
            : { defaultValue: "" }),
          ...(field.options ? { options: field.options } : { options: null }),
          ...(field.label ? { label: field.label } : { label: "" }),
        }
      })

      await db("forms").insert({
        name,
        ordered_fields: JSON.stringify(orderedFieldsData),
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
        const orderedFieldsData = ordered_fields.map((field) => {
          return {
            ...(field.fieldId ? { fieldId: field.fieldId } : {}),
            ...(field.defaultValue
              ? { defaultValue: field.defaultValue }
              : { defaultValue: "" }),
            ...(field.options ? { options: field.options } : { options: null }),
            ...(field.label ? { label: field.label } : { label: "" }),
          }
        })

        updates.ordered_fields = JSON.stringify(orderedFieldsData)
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

  app.get(
    "/fields",
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

      const field = await FieldModel.query().limit(limit).offset(offset)

      const totalCount = await FieldModel.query().count("* as total").first()

      res.send({
        data: field,
        meta: {
          totalCount: parseInt(totalCount.total, 10),
        },
      })
    }
  )

  app.patch(
    "/fields/:fieldId",
    auth,
    perms("form", "update"),
    validate({
      params: {
        fieldId: idValidator.required(),
      },
      body: {
        defaultValue: defaultValueValidator,
        options: optionsValidator,
        label: labelValidator,
      },
    }),
    async (req, res) => {
      const { defaultValue, options, label } = req.locals.body
      const { fieldId } = req.locals.params

      const field = await FieldModel.query().findById(fieldId)

      if (!field) {
        res.status(404).send({ error: "Not found!" })

        return
      }

      const updates = {
        ...(defaultValue ? { defaultValue } : {}),
        ...(options ? { options: JSON.stringify(options) } : {}),
        ...(label ? { label } : {}),
      }

      await FieldModel.query().update(updates).where({
        id: fieldId,
      })

      const updatedField = await FieldModel.query().findById(fieldId)

      res.send({ data: updatedField })
    }
  )
}

export default prepareFormRoutes
