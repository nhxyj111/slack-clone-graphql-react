import requiresAuth, { directMessageSubscription } from '../permissions';
import { PubSub, withFilter } from 'graphql-subscriptions';

// const pubsub = new PubSub();
import pubsub from '../pubsub';

const NEW_DIRECT_MESSAGE = 'NEW_DIRECT_MESSAGE';


export default {
  Subscription: {
    newDirectMessage: {
      subscribe: directMessageSubscription.createResolver(withFilter(
        () => {
          return pubsub.asyncIterator(NEW_DIRECT_MESSAGE)
        },
        (payload, args, { user }) => {
         return (payload.teamId === args.teamId) &&
          ((payload.senderId === user.id && payload.receiverId === args.userId) ||
            (payload.receiverId === user.id && payload.senderId === args.userId));
        }
      )),
    }
  },
  DirectMessage: {
    sender: ({ sender, senderId }, args, { models }) => {
      if (sender) {
        return sender;
      }
      return models.User.findOne({ where: { id: senderId } }, { raw: true })
    }
  },
  Query: {
    directMessages: requiresAuth.createResolver(async (parent, { teamId, otherUserId }, { models, user }) => (
      await models.DirectMessage.findAll({
        order: [['createdAt', 'ASC']],
        where: { teamId, [models.sequelize.Op.or]: [{
          [models.sequelize.Op.and]: [{receiverId: otherUserId}, {senderId: user.id}]
        }, {
          [models.sequelize.Op.and]: [{receiverId: user.id}, {senderId: otherUserId}]
        }] }
      }, { raw: true })
    ))
  },
  Mutation: {
    createDirectMessage: async (parent, args, { models, user }) => {
      try {
        const directMessage = await models.DirectMessage.create({ ...args, senderId: user.id });

        pubsub.publish(NEW_DIRECT_MESSAGE, {
          teamId: args.teamId,
          senderId: user.id,
          receiverId: args.receiverId,
          newDirectMessage: {
            ...directMessage.dataValues,
            sender: { username: user.username }
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
