interface AddToCartInput {
  userId: string;
  menuItemId: string;
  variants: string[];
  addons: string[];
  quantity: number;
}

export type { AddToCartInput };
