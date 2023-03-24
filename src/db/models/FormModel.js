import BaseModel from "./BaseModel.js"
import UserModel from "./UserModel.js"

class FormModel extends BaseModel {
  static tableName = "forms"

  static get relationMappings() {
    return {
      form: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: "users.id",
          to: "forms.userCreatorId",
        },
      },
    }
  }
}

export default FormModel
