import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../../lib";

export interface ContactInstance extends Model {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
}

export const Contact = sequelize.define<ContactInstance>(
  "Contact",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "contacts",
    timestamps: true,
    underscored: true,
  }
);
