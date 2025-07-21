import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import LinkedInProvider from 'next-auth/providers/linkedin'
import { NextAuthOptions } from 'next-auth'

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'r_liteprofile r_emailaddress w_member_social',
        },
      },
    }),
    // Instagram Basic Display API
    {
      id: 'instagram',
      name: 'Instagram',
      type: 'oauth',
      authorization: {
        url: 'https://api.instagram.com/oauth/authorize',
        params: {
          scope: 'user_profile,user_media',
          response_type: 'code',
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/instagram`,
        },
      },
      token: {
        url: 'https://api.instagram.com/oauth/access_token',
        async request(context) {
          const { client_id, client_secret, code } = context.params
          const redirect_uri = `${process.env.NEXTAUTH_URL}/api/auth/callback/instagram`
          
          const response = await fetch('https://api.instagram.com/oauth/access_token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: client_id as string,
              client_secret: client_secret as string,
              grant_type: 'authorization_code',
              redirect_uri: redirect_uri,
              code: code as string,
            }),
          })
          
          const tokens = await response.json()
          
          if (!response.ok) {
            throw new Error(`Instagram token exchange failed: ${JSON.stringify(tokens)}`)
          }
          
          return {
            tokens: {
              access_token: tokens.access_token,
              token_type: 'Bearer',
            },
          }
        },
      },
      userinfo: 'https://graph.instagram.com/me?fields=id,username',
      clientId: process.env.INSTAGRAM_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.username,
          email: null,
          image: null,
        }
      },
    },
    // Instagram Graph API (Business/Creator)
    {
      id: 'instagram-business',
      name: 'Instagram Business',
      type: 'oauth',
      authorization: {
        url: 'https://www.facebook.com/v18.0/dialog/oauth',
        params: {
          scope: 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement',
          response_type: 'code',
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/instagram-business`,
        },
      },
      token: {
        url: 'https://graph.facebook.com/v18.0/oauth/access_token',
        async request(context) {
          const { client_id, client_secret, code } = context.params
          const redirect_uri = `${process.env.NEXTAUTH_URL}/api/auth/callback/instagram-business`
          
          const response = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: client_id as string,
              client_secret: client_secret as string,
              grant_type: 'authorization_code',
              redirect_uri: redirect_uri,
              code: code as string,
            }),
          })
          
          const tokens = await response.json()
          
          if (!response.ok) {
            throw new Error(`Instagram Business token exchange failed: ${JSON.stringify(tokens)}`)
          }
          
          return {
            tokens: {
              access_token: tokens.access_token,
              token_type: 'Bearer',
            },
          }
        },
      },
      userinfo: 'https://graph.facebook.com/me?fields=id,name',
      clientId: process.env.INSTAGRAM_BUSINESS_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_BUSINESS_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: null,
          image: null,
        }
      },
    },
    // Reddit
    {
      id: 'reddit',
      name: 'Reddit',
      type: 'oauth',
      authorization: {
        url: 'https://www.reddit.com/api/v1/authorize',
        params: {
          scope: 'identity submit',
          response_type: 'code',
          duration: 'permanent',
        },
      },
      token: 'https://www.reddit.com/api/v1/access_token',
      userinfo: 'https://oauth.reddit.com/api/v1/me',
      clientId: process.env.REDDIT_CLIENT_ID!,
      clientSecret: process.env.REDDIT_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: null,
          image: profile.icon_img,
        }
      },
    },
    // TikTok (Custom implementation needed)
    {
      id: 'tiktok',
      name: 'TikTok',
      type: 'oauth',
      authorization: {
        url: 'https://www.tiktok.com/auth/authorize/',
        params: {
          scope: 'user.info.basic,video.publish',
          response_type: 'code',
        },
      },
      token: 'https://open-api.tiktok.com/oauth/access_token/',
      userinfo: 'https://open-api.tiktok.com/user/info/',
      clientId: process.env.TIKTOK_CLIENT_ID!,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.data.user.open_id,
          name: profile.data.user.display_name,
          email: null,
          image: profile.data.user.avatar_url,
        }
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      session.provider = token.provider as string
      return session
    },
  },
  // Using default NextAuth pages
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST, authOptions }