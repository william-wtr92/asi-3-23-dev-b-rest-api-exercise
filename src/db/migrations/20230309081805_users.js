export const up = async (knex) => {
  await knex.schema.createTable("roles", (table) => {
    table.increments("id")
    table
      .enu("name", ["admin", "manager", "editor"])
      .notNullable()
      .defaultTo("editor")
    table.json("permissions").notNullable()
  })

  await knex.schema.createTable("users", (table) => {
    table.increments("id")
    table.text("firstName").notNullable()
    table.text("lastName").notNullable()
    table.text("email").notNullable().unique()
    table.text("passwordHash")
    table.text("passwordSalt")
    table.integer("roleId").notNullable().references("id").inTable("roles")
  })
}

export const down = async (knex) => {
  await knex.schema.dropTable("users")
  await knex.schema.dropTable("roles")
}
