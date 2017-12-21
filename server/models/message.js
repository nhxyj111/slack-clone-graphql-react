export default (sequelize, DataTypes) => {
  const Message = sequelize.define('message', {
    text: {
      type: DataTypes.STRING,
    },
    url: {
      type: DataTypes.STRING,
    },
    filetype: {
      type: DataTypes.STRING,
    },
  }, {
    indexes: [
      {
        fields: ['createdAt']
      }
    ]
  });

  Message.associate = models => {
    Message.belongsTo(models.Channel, {
      foreignKey: 'channelId'
    });
    Message.belongsTo(models.User, {
      foreignKey: 'userId'
    });
  };
  return Message;
};
