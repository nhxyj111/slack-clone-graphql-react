import requiresAuth, { requiresTeamAccess } from '../permissions';
import { PubSub, withFilter } from 'graphql-subscriptions';

// const pubsub = new PubSub();
import pubsub from '../pubsub';

const NEW_CHANNEL_MESSAGE = 'NEW_CHANNEL_MESSAGE';


export default {
  Subscription: {
    newChannelMessage: {
      subscribe: requiresTeamAccess.createResolver(withFilter(
        () => {
          // check if part of team
          // const channel = await models.Channel.findOne({ where: { id: channelId } });
          // const member = await models.Member.findOne({ where: { teamId: channel.teamId, userId: user.id } });
          // if (!member) throw new Error("You have to be member of the team to subscribe to it's messages");
          return pubsub.asyncIterator(NEW_CHANNEL_MESSAGE)
        },
        (payload, args) => {
          // console.log('z/////');
          // console.log(payload);
         return payload.channelId === args.channelId;
        }
      )),
    }
  },
  Message: {
    url: parent => (parent.url ? `http://localhost:8080/${parent.url}` : parent.url),
    user: ({ user, userId }, args, { models }) => {
      if (user) {
        return user;
      }
      return models.User.findOne({ where: { id: userId } }, { raw: true })
    }
  },
  Query: {
    messages: requiresAuth.createResolver(async (parent, { offset, channelId }, { models, user }) => {
      const channel = await models.Channel.findOne({ where: { id: channelId }, raw: true });
      if (!channel.public) {
        const member = await models.PCMember.findOne({ where: { channelId, userId: user.id }, raw: true });
        if (!member) {
          throw new Error('Not Authorized');
        }
      }
      return await models.Message.findAll({
        order: [['createdAt', 'DESC']],
        where: { channelId }, limit: 10, offset }, { raw: true });
    })
  },
  Mutation: {
    createMessage: async (parent, { file, ...args }, { models, user }) => {
      try {
        const messageData = args;
        if (file) {
          messageData.filetype = file.type;
          messageData.url = file.path;
        }
        const message = await models.Message.create({ ...messageData, userId: user.id });
        const currentUser = await models.User.findOne({
          where: {
            id: user.id
          }
        }, { raw: true });
        // console.log('--------');
        // console.log(message.dataValues);
        // console.log(currentUser.dataValues);
        pubsub.publish(NEW_CHANNEL_MESSAGE, {
          channelId: args.channelId,
          newChannelMessage: {
            ...message.dataValues,
            user: currentUser.dataValues
          }
        })
        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    }
  }
}
