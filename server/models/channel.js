export default (sequelize, DataTypes) => {
  const Channel = sequelize.define('channel', {
    name: DataTypes.STRING,
    public: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    dm: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  Channel.associate = models => {
    Channel.belongsTo(models.Team, {
      foreignKey: 'teamId'
    });

    Channel.belongsToMany(models.User, {
      through: 'channel_member',
      foreignKey: 'channelId'
    });

    Channel.belongsToMany(models.User, {
      through: models.PCMember,
      foreignKey: 'channelId'
    });
  };
  return Channel;
};
