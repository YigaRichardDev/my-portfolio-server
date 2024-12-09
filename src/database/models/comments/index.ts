import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../../lib";
import { Blog } from "../blogs";

export interface CommentInstance extends Model {
    id: number;
    blog_id: number;
    parent_comment_id: number | null;
    comment: string;
    name: string;
    date: Date;
}

export const Comment = sequelize.define<CommentInstance>(
    "Comment",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            unique: true,
        },
        blog_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Blog, // References the Blog model
                key: "id",
            },
            onDelete: "CASCADE", // Deletes comments if the associated blog is deleted
        },
        parent_comment_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "comments", // Self-references the comments table
                key: "id",
            },
            onDelete: "CASCADE", // Deletes replies if the parent comment is deleted
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
    },
    {
        tableName: "comments",
        timestamps: true,
        underscored: true,
    }
);


// Blog-Comment Relationship
Blog.hasMany(Comment, {
    foreignKey: "blog_id",
    onDelete: "CASCADE",
});

Comment.belongsTo(Blog, {
    foreignKey: "blog_id",
});

// Comment Self-Referencing Relationship
Comment.hasMany(Comment, {
    foreignKey: "parent_comment_id",
    as: "replies", // Alias for child comments
    onDelete: "CASCADE",
});

Comment.belongsTo(Comment, {
    foreignKey: "parent_comment_id",
    as: "parentComment", // Alias for parent comment
});