'use strict';
const BlogPost = (sequelize, DataTypes) => {
  const BlogPost = sequelize.define('BlogPost', {
    id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    published: DataTypes.DATE,
    updated: DataTypes.DATE,
  })

  BlogPost.associate = (models) => {
    BlogPost.belongsTo(models.User,
      { foreingKey: 'userId', as: 'users' });
  };

  return BlogPost;
};



module.exports = BlogPost;