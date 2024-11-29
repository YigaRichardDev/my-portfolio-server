import { Model, DataTypes } from "sequelize";
import { sequelize } from "../.."; 

export interface TestimonialInstance extends Model {
  id: number;
  name: string;
  message: string;
}

export const Testimonial = sequelize.define<TestimonialInstance>(
  "Testimonial",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "testimonials",
    timestamps: true,
    underscored: true,
  }
);
