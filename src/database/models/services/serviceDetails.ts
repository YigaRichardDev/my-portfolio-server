import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../../lib"; // Adjust the path to where your sequelize instance is located
import { Service } from ".";

export interface ServiceDetailInstance extends Model {
    id: number;
    serviceId: number;
    detail: string | null;
    approach: string | null;
    image: string | null;
}

export const ServiceDetail = sequelize.define<ServiceDetailInstance>(
    "ServiceDetail",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            unique: true,
        },
        service_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Service, 
                key: "id",
            },
            onDelete: "CASCADE", // When a service is deleted, related service details will be deleted
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
        tableName: "service_details",
        timestamps: true,
        underscored: true, // This will use snake_case in the database for column names
    }
);


Service.hasMany(ServiceDetail, {
    foreignKey: "service_id", // foreign key in service_details
    onDelete: "CASCADE", // When a service is deleted, all its details will be deleted
});

ServiceDetail.belongsTo(Service, {
    foreignKey: "service_id", // foreign key in service_details
    onDelete: "CASCADE", // When a service is deleted, the service detail is also deleted
});