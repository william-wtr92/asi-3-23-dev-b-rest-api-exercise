import prepareUserRoutes from "./routes/prepareUserRoutes.js"
import prepareSignInRoutes from "./routes/prepareSignInRoutes.js"
import preparePageRoutes from "./routes/preparePageRoutes.js"
import prepareNavigationMenuRoutes from "./routes/prepareNavigationMenuRoutes.js"
import prepareFormRoutes from "./routes/prepareFormRoutes.js"

const prepareRoutes = (ctx) => {
  prepareUserRoutes(ctx)
  prepareSignInRoutes(ctx)
  preparePageRoutes(ctx)
  prepareNavigationMenuRoutes(ctx)
  prepareFormRoutes(ctx)
}

export default prepareRoutes
