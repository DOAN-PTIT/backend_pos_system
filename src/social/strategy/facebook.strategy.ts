import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: 'http://localhost:8000/social/facebook/redirect',
      scope: [
        'public_profile',
        'email',
        'pages_manage_metadata',
        'pages_read_engagement',
        'pages_show_list',
        'pages_read_user_content',
        'pages_manage_posts',
        'pages_manage_engagement',
        'pages_messaging',
        'page_events',
        'pages_show_list',
        'ads_management',
        'catalog_management',
        'leads_retrieval',
        'business_management',
      ],
      profileFields: ['emails', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { name, emails } = profile;

    const payload = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      accessToken,
    };
    
    done(null, payload);
  }
}
