export const up = async (knex) => {
  await knex.schema.createTable("navigation_menu", (table) => {
    table.increments("id")
    table.text("name").notNullable()
    table.integer("parentId").notNullable()
    table.integer("pageId").nullable().references("id").inTable("pages")
  })
}

export const down = async (knex) => {
  await knex.schema.dropTable("navigation_menu")
}
