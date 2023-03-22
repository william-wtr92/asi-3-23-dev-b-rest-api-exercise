import knex from "knex"
import config from "../../config.js"
import hashPassword from "../hashPassword.js"

const db = knex(config.db)

const [passwordHash, passwordSalt] = await hashPassword("LesDmByAvetis99?")

await db("users").insert([
  {
    firstName: "Wil",
    lastName: "UUUUUU",
    email: "william@quoicoubeh.fr",
    passwordHash: passwordHash,
    passwordSalt: passwordSalt,
    roleId: 1,
  },
])

await db("navigation_menu").insert([
  {
    name: "Hello",
    parentId: 1,
  },
])

process.exit(0)
