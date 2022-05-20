'use strict';
const BlogPost = (sequelize, DataTypes) => {
  return sequelize.define('BlogPost', {
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    userId: DataTypes.INTEGER
  });
};

BlogPost.associate = (models) => {
  BlogPost.belongsToMany(models.User,
    { foreingKey: 'userId', as: 'users' });
};

module.exports = BlogPost;