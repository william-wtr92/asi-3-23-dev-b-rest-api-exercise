import * as yup from "yup"

//generic

export const stringValidator = yup.string()

export const idValidator = yup.number().integer().min(1)

//users

export const firstNameValidator = yup.string().min(1)

export const lastNameValidator = yup.string().min(1)

export const emailValidator = yup.string().email()

export const passwordValidator = yup
  .string()
  .min(8)
  .matches(
    /^(?=.*[\p{Ll}])(?=.*[\p{Lu}])(?=.*[0-9])(?=.*[^0-9\p{Lu}\p{Ll}]).*$/gu,
    "Password must contain at least 1 upper & 1 lower case letters, 1 digit, 1 spe. character"
  )
  .label("Password")

export const roleIdValidator = yup.number().integer().default(1)

//pages

export const titleValidator = yup.string().trim()

export const contentValidator = yup.string().trim()

export const statusValidator = yup.string().trim()

//navigation_menu

export const menuNameValidator = yup.string().trim()

//pagination

export const offsetValidator = yup.number().integer().min(0)

export const limitValidator = yup.number().integer().min(1).max(100).default(5)
