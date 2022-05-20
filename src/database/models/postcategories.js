'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define({
    postId: DataTypes.INTEGER,
    categoryId: DataTypes.INTEGER
  }, {
    timestamps: false
  });
};

PostCategories.associate = (models) => {
  models.BlogPost.belongsToMany(models.Category, {
    as: 'categories',
    through: PostCategories,
    foreignKey: 'id',
    otherKey: 'id',
  });
  models.Category.belongsToMany(models.BlogPost, {
    as: 'blogPost',
    through: PostCategories,
    foreignKey: 'id',
    otherKey: 'id',
  });
};