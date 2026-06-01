import { AddressCreateInput } from "../generated/prisma/models.js";

export type AddressInput = Omit<
  AddressCreateInput & { userId: string },
  "user"
>;
