export const up = async (knex) => {
  await knex("roles").insert([
    {
      name: "admin",
      permissions: {
        users: { create: true, read: true, update: true, delete: true },
        pages: { create: true, read: true, update: true, delete: true },
        navmenu: { create: true, read: true, update: true, delete: true },
        form: { create: true, read: true, update: true, delete: true },
      },
    },
    {
      name: "manager",
      permissions: {
        users: { create: false, read: false, update: false, delete: false },
        pages: { create: true, read: true, update: true, delete: true },
        navmenu: { create: true, read: true, update: true, delete: true },
        form: { create: true, read: true, update: true, delete: true },
      },
    },
    {
      name: "editor",
      permissions: {
        users: { create: false, read: false, update: false, delete: false },
        pages: { create: false, read: true, update: false, delete: false },
        navmenu: { create: false, read: true, update: false, delete: false },
        form: { create: false, read: true, update: false, delete: false },
      },
    },
  ])
}

export const down = async (knex) => {
  await knex("roles").del()
}
