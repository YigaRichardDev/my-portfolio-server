import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../../lib/index";

export interface UserInstance extends Model {
  id: number;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'super_admin';
  refresh_token: string | null;
  is_active: 'Yes' | 'No'; 
}

export const User = sequelize.define<UserInstance>(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'super_admin'),
      allowNull: false,
      defaultValue: 'admin',
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    is_active: {
      type: DataTypes.ENUM('Yes', 'No'),
      allowNull: false,
      defaultValue: 'No',
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
  }
);
