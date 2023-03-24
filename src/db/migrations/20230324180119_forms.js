export const up = async (knex) => {
  await knex.schema.createTable("fields", (table) => {
    table.increments("id")
    table
      .enu("type", [
        "singleLineText",
        "multiLineText",
        "radio",
        "select",
        "checkbox",
      ])
      .notNullable()
    table.json("options").nullable()
    table.text("label").nullable()
    table.text("defaultValue").nullable()
  })

  await knex("fields").insert([
    {
      type: "singleLineText",
      options: {},
    },
    {
      type: "multiLineText",
      options: {},
    },
    {
      type: "radio",
      options: {},
    },
    {
      type: "select",
      options: {},
    },
    {
      type: "checkbox",
      options: {},
    },
  ])

  await knex.schema.createTable("forms", (table) => {
    table.increments("id").primary()
    table.text("name").notNullable()
    table.json("ordered_fields").notNullable()
    table.timestamps(true, true)
    table
      .integer("userCreatorId")
      .notNullable()
      .references("id")
      .inTable("users")
  })
}

export const down = async (knex) => {
  await knex("fields").del()
  await knex.schema.dropTable("fields")
  await knex.schema.dropTable("forms")
}
