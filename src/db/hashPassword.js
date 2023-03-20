import { promisify } from "node:util"
import config from "../config.js"
import crypto from "node:crypto"

const pbkdf2 = promisify(crypto.pbkdf2)

const hashPassword = async (
  password,
  salt = crypto.randomBytes(config.security.password.saltLen).toString("hex")
) => [
  (
    await pbkdf2(
      `${password}${config.security.password.pepper}`,
      salt,
      config.security.password.iterations,
      config.security.password.keylen,
      config.security.password.digest
    )
  ).toString("hex"),
  salt,
]

export default hashPassword
