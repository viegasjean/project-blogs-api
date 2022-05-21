const User = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    id: DataTypes.INTEGER,
    displayName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    image: DataTypes.STRING
  }, {
    timestamps: false,
  });
};

User.associate = (models) => {
  User.hasOne(models.BlogsPost,
    { foreingKey: 'userId', as: 'users' });
};

module.exports = User;