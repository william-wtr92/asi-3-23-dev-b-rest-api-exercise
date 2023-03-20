import { deepmerge } from "deepmerge-ts"
import * as yup from "yup"

const createValidator = (name, schema) =>
  schema && { [name]: yup.object().shape(schema) }

const validate = (schema) => {
  const validator = yup.object().shape(
    Object.fromEntries(
      Object.entries({
        ...createValidator("body", schema.body),
        ...createValidator("params", schema.params),
        ...createValidator("query", schema.query),
      })
    )
  )

  return async (req, res, next) => {
    try {
      const { body, params, query } = await validator.validate(
        {
          body: req.body,
          params: req.params,
          query: req.query,
        },
        { abortEarly: false }
      )

      req.locals = deepmerge(req.locals, {
        body,
        params,
        query,
      })

      next()
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        res.status(422).send({ error: err.errors })

        return
      }

      res.status(500).send({ error: "Oops. Something went wrong." })
    }
  }
}

export default validate
