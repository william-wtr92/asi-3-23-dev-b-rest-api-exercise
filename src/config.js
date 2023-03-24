import "dotenv/config"

const config = {
  port: process.env.PORT,
  db: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    },
    migrations: {
      directory: "./src/db/migrations",
      stub: "./src/db/migration.stub",
    },
    seeds: {
      directory: "./src/db/seeds",
    },
  },
  logger: {
    format: process.env.LOGGER_FORMAT || "dev",
  },
  security: {
    jwt: {
      secret: process.env.SECURITY_JWT_SECRET,
      options: {
        expiresIn: "2 days",
      },
    },
    password: {
      saltLen: 128,
      keylen: 128,
      iterations: 10000,
      digest: "sha512",
      pepper: process.env.SECURITY_PASSWORD_PEPPER,
    },
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
  },
}

export default config
