const { User } = require ('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if(context.user) {
                const userData = await User.findOne({_id: context.user._id});
                return userData;
            }

            throw AuthenticationError;
        },
    },

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            console.log(user, "==========");
            console.log(token, "===========");
            return { token, user};
        },

        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});
            if(!user){
                throw AuthenticationError
            }

            const correctCd = await user.isCorrectPassword(password);
            if(!correctCd){
                throw AuthenticationError
            }

            const token  = signToken(user);
            return { token, user };
        },

        saveBook: async (parent, { input }, context) => {
            if(context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: input } },
                    { new: true }    
                ).populate('savedBooks');
                return updatedUser;
            }

            throw AuthenticationError;
        },

        removeBook: async (parent, {bookId}, context) => {
            if(context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: bookId } } },
                    { new: true }
                ).populate("savedBooks");

                return updatedUser;
            }

            throw AuthenticationError
        },
    },
};

module.exports = resolvers;