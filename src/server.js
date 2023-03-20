import express from "express"
import knex from "knex"
import morgan from "morgan"
import cors from "cors"
import BaseModel from "./db/models/BaseModel.js"
import prepareRoutes from "./prepareRoutes.js"

const server = async (config) => {
  const db = knex(config.db)

  BaseModel.knex(db)

  const app = express()

  app.use((req, res, next) => {
    req.locals = {}

    next()
  })
  app.use(express.json())
  app.use(morgan(config.logger.format))
  app.use(cors())

  prepareRoutes({ app, db })

  // eslint-disable-next-line no-console
  app.listen(config.port, () => console.log(`Listening on :${config.port}`))
}

export default server
