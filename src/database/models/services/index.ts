import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../../lib"; 

export interface ServiceInstance extends Model {
  id: number;
  title: string;
  description: string;
  image: string | null;
  slug: string;
}

export const Service = sequelize.define<ServiceInstance>(
  "Service",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "services",
    timestamps: true, 
    underscored: true, 
  }
);
