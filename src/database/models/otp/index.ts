import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../../lib";
import { User } from "../users";

export interface OTPInstance extends Model {
    id: number;
    user_id: number;
    otp_code: string;
    expiration_time: Date;
}

export const OTP = sequelize.define<OTPInstance>(
    "OTP",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            unique: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: "id",
            },
            onDelete: "CASCADE",
        },
        otp_code: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        expiration_time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        tableName: "otp",
        timestamps: true, 
        underscored: true, 
    }
);

// User-Otp Relationship
User.hasMany(OTP, { 
    foreignKey: "user_id",
    onDelete: "CASCADE" 
});

OTP.belongsTo(User, { 
    foreignKey: "user_id",
});
