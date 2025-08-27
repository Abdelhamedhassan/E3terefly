import { rolesEmum } from "../../DB/models/User.model.js";

export const endPoint = {
  profile: [...Object.values(rolesEmum)],
};
