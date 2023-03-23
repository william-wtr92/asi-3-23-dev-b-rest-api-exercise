import BaseModel from "./BaseModel.js"
import PageModel from "./PageModel.js"

class NavigationMenuModel extends BaseModel {
  static tableName = "navigation_menu"

  static get relationMappings() {
    return {
      page: {
        modelClass: PageModel,
        relation: BaseModel.BelongsToOneRelation,
        join: {
          from: "navigation_menu.pageId",
          to: "pages.id",
        },
      },
    }
  }
}

export default NavigationMenuModel
