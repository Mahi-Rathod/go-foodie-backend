interface PlaceOrderInput {
  userId: string;
  orders: {
    restaurantId: string;
    menuItemId: string;
    variants: string[];
    addons: string[];
    quantity: number;
    price: number;
  }[];
}

export type { PlaceOrderInput };
