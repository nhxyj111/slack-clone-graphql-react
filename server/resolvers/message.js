import requiresAuth from '../permissions';
import { PubSub, withFilter } from 'graphql-subscriptions';

const pubsub = new PubSub();

const NEW_CHANNEL_MESSAGE = 'NEW_CHANNEL_MESSAGE';


export default {
  Subscription: {
    newChannelMessage: {
      subscribe: withFilter(
        (parent, { channelId }, { models, user }) => {
          // check if part of team
          // const channel = await models.Channel.findOne({ where: { id: channelId } });
          // const member = await models.Member.findOne({ where: { teamId: channel.teamId, userId: user.id } });
          // if (!member) throw new Error("You have to be member of the team to subscribe to it's messages");
          pubsub.asyncIterator(NEW_CHANNEL_MESSAGE)
        },
        (payload, args) => {
          // console.log('z/////');
          // console.log(payload);
         return payload.channelId === args.channelId;
        }
      ),
    }
  },
  Message: {
    user: ({ user, userId }, args, { models }) => {
      if (user) {
        return user;
      }
      return models.User.findOne({ where: { id: userId } }, { raw: true })
    }
  },
  Query: {
    messages: requiresAuth.createResolver(async (parent, { channelId }, { models, user }) => (
      await models.Message.findAll({
        order: [['createdAt', 'ASC']],
        where: { channelId } }, { raw: true
      })
    ))
  },
  Mutation: {
    createMessage: async (parent, args, { models, user }) => {
      try {
        const message = await models.Message.create({ ...args, userId: user.id });
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
