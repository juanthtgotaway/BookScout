import { gql } from '@apollo/client';

export const GET_ME = gql`
    {
    me {
      username
      savedBooks {
        bookId
        authors
        description
        title
        image
        link
      }
    }
  }
`;