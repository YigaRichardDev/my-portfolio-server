import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../../lib"; 

export interface ProjectInstance extends Model {
  id: number;
  name: string;
  category: string;
  image: string | null;
  link: string | null;
}

export const Project = sequelize.define<ProjectInstance>(
  "Project",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    link: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "projects",
    timestamps: true, 
    underscored: true, 
  }
);
