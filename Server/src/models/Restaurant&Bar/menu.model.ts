import mongoose, { Schema, Document } from "mongoose";

export interface IMenu extends Document {
  itemId: string;
  name: string;
  section: "Starters" | "Mains" | "Desserts" | "Drinks" | "Sides"; // Enum for sections
  category: string;
  price: number;
  availability: boolean;
  dynamicPricing: boolean;
  description: string;
}

const MenuSchema = new Schema<IMenu>({
  itemId: [{ type: String, required: true, unique: true }],
  name: { type: String, required: true },
  section: {
    type: String,
    enum: ["Starters", "Mains", "Desserts", "Drinks", "Sides"],
    required: true,
  },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  availability: { type: Boolean, required: true },
  dynamicPricing: { type: Boolean, required: true },
  description: { type: String },
});

export default mongoose.model<IMenu>("Menu", MenuSchema);
