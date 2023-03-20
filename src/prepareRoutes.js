import prepareUserRoutes from "./routes/prepareUserRoutes.js"
import prepareSignInRoutes from "./routes/prepareSignInRoutes.js"
import preparePageRoutes from "./routes/preparePageRoutes.js"
import prepareNavigationMenuRoutes from "./routes/prepareNavigationMenuRoutes.js"

const prepareRoutes = (ctx) => {
  prepareUserRoutes(ctx)
  prepareSignInRoutes(ctx)
  preparePageRoutes(ctx)
  prepareNavigationMenuRoutes(ctx)
}

export default prepareRoutes
