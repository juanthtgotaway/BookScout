const { User } = require ('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');


const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if(context.user) {
                const userInfo = await User.findOne({})
                .select('-__v -password')
                .populate('books')

                return userInfo;
            }

            throw new AuthenticationError('You must log in!');
        },
    },

    Mutation: {
        addUser: async (parent, arg) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user};
        },

        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});
            if(!user){
                throw new AuthenticationError('Incorrect login information ☹️')
            }

            const correctCd = await user.isCorrectPassword(password);
            if(!correctCd){
                throw new AuthenticationError('Incorrect login information ☹️')
            }

            const token  = signToken(user);
            return { token, user };
        },

        saveBook: async (parent, args, context) => {
            if(context.user) {
                const updatedUser = await User.findByIdandUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: args.input } },
                    { new: true }    
                );
                return updatedUser;
            }

            throw new AuthenticationError('You must log in!');
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

            throw new AuthenticationError("You must login!")
        },
    },
};

module.exports = resolvers;