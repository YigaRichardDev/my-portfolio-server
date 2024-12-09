import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../../lib"; 
import { User } from "../users"; 

export interface BlogInstance extends Model {
  id: number;
  title: string;
  content: string;
  image: string | null;
  user_id: number;
  category: string;
  slug: string;
  meta_description: string | null;
  date: Date;
}

export const Blog = sequelize.define<BlogInstance>(
  "Blog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User, // This references the User model
        key: "id",
      },
      onDelete: "CASCADE", // Deletes blog entries if the associated user is deleted
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    meta_description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    tableName: "blogs",
    timestamps: true, 
    underscored: true, 
  }
);

// User-Blog Relationship
User.hasMany(Blog, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

Blog.belongsTo(User, {
  foreignKey: "user_id",
});