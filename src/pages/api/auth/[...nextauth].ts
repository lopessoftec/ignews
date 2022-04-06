import { query as q } from 'faunadb';

import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

import { fauna } from '../../../services/fauna';

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: 'read:user'
    }),
  ],
  callbacks: {
    async signIn(user, account, profile) {
      // console.log(user);
      const { email } = user;

      // se deu erro ao acessar o banco ele não faz login
      try {
        await fauna.query(
          // se ão existir um usuario com aquele email
          q.If(
            q.Not(
              q.Exists(
                // where o de baixo
                q.Match(
                  q.Index('user_by_email'),
                  q.Casefold(user.email)
                )
              )
            ),
            // se não existe ele cria
            q.Create(
              q.Collection('users'),
              { data: { email } }
            ),
            // select
            q.Get(
              q.Match(
                q.Index('user_by_email'),
                q.Casefold(user.email)
              )
            )
          )
        )
  
        return true;
      }catch {
        return false;
      }
    },
  }
})

//6,29