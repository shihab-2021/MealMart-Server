import { Model, Types } from "mongoose";

interface IIngredient {
  ingredientName: string;
  description: string;
}

interface IReview {
  rating: number;
  user: Types.ObjectId;
  description: string;
}

export interface IMeal {
  mealName: string;
  orgId: Types.ObjectId;
  description: string;
  price: number;
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  category:
    | "Smoothies"
    | "Breakfast Bowls"
    | "Pasta"
    | "Harvest Bowls"
    | "Grains"
    | "Soups"
    | "Snacks";
  allIngredients: string;
  keyIngredients: IIngredient[];
  prepSteps: string[];
  reviews: IReview[];
  images: string[];
  inStock?: boolean;
}

export interface MealModel extends Model<IMeal> {
  // eslint-disable-next-line no-unused-vars
  isMealExistsById(id: string): Promise<IMeal>;
}
