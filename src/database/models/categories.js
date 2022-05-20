'use strict';
const Category = (sequelize, DataTypes) => {
  return sequelize.define('Category', {
    name: DataTypes.STRING
  }, {
    timestamps: false
  });
};