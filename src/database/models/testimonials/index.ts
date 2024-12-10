import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../../lib"; 

export interface TestimonialInstance extends Model {
  id: number;
  name: string;
  message: string;
  image: string | null;
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
    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "testimonials",
    timestamps: true,
    underscored: true,
  }
);
