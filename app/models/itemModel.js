import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Item = sequelize.define("Item", {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'items',
  timestamps: false
});

await Item.sync();

export default Item;
