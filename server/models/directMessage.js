export default (sequelize, DataTypes) => {
  const DirectMessage = sequelize.define('direct_message', {
    text: {
      type: DataTypes.STRING,
    },
  });

  DirectMessage.associate = models => {
    DirectMessage.belongsTo(models.Team, {
      foreignKey: 'teamId'
    });
    DirectMessage.belongsTo(models.User, {
      foreignKey: 'receiverId'
    });
    DirectMessage.belongsTo(models.User, {
      foreignKey: 'senderId'
    });
  };
  return DirectMessage;
};
