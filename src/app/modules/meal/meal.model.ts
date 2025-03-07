import { Schema } from "mongoose";
import { IMeal, MealModel } from "./meal.interface";
import { model } from "mongoose";

const mealSchema = new Schema<IMeal>(
  {
    mealName: {
      type: String,
      required: [true, "Please provide meal name!"],
    },
    orgId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
    },
    description: {
      type: String,
      required: [true, "Please provide meal description!"],
    },
    price: {
      type: Number,
      required: [true, "Please provide meal price!"],
    },
    nutritionalInfo: {
      calories: {
        type: Number,
        required: [true, "Please provide meal calories!"],
      },
      protein: {
        type: Number,
        required: [true, "Please provide meal protein!"],
      },
      carbs: {
        type: Number,
        required: [true, "Please provide meal carbs!"],
      },
      fat: {
        type: Number,
        required: [true, "Please provide meal fat!"],
      },
    },
    category: {
      type: String,
      enum: [
        "Smoothies",
        "Breakfast Bowls",
        "Pasta",
        "Harvest Bowls",
        "Grains",
        "Soups",
        "Snacks",
      ],
      required: [true, "Please provide a collection!"],
    },
    keyIngredients: [
      {
        ingredientName: { type: String },
        description: { type: String },
      },
    ],
    prepSteps: [
      {
        type: String,
        required: true,
      },
    ],
    reviews: [
      {
        rating: { type: Number },
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        description: { type: String },
      },
    ],
    images: [
      {
        type: String,
        required: true,
      },
    ],
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// checking if the meal exist by _id
mealSchema.statics.isMealExistsById = async function (id: string) {
  return await Meal.findById(id);
};

export const Meal = model<IMeal, MealModel>("Meal", mealSchema);
