export const up = async (knex) => {
  await knex.schema.createTable("pages", (table) => {
    table.increments("id")
    table.text("title").notNullable()
    table.text("content").notNullable()
    table.text("urlSlug").unique().notNullable()
    table
      .integer("userCreatorId")
      .notNullable()
      .references("id")
      .inTable("users")
    table.json("userUpdateId").nullable()
    table.timestamps(true, true)
    table.enu("status", ["draft", "published"]).notNullable()
  })
}

export const down = async (knex) => {
  await knex.schema.dropTable("pages")
}
