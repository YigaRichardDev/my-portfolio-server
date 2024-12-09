import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../../lib"; 

export interface ServiceInstance extends Model {
  id: number;
  title: string;
  description: string;
  icon: string | null;
  slug: string;
  detail: string | null;
  approach: string | null;
  image: string | null;
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
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    detail: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    approach: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "services",
    timestamps: true, 
    underscored: true, 
  }
);
