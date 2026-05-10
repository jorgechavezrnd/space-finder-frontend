import { Amplify } from 'aws-amplify';
import { type SignInOutput, fetchAuthSession, signIn } from '@aws-amplify/auth';
import { AuthStack } from '../../../space-finder/outputs.json';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';

const awsRegion = 'us-east-1';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: AuthStack.SpaceUserPoolId,
      userPoolClientId: AuthStack.SpaceUserPoolClientId,
      identityPoolId: AuthStack.SpaceIdentityPoolId
    }
  }
});

export class AuthService {
  private user: SignInOutput | undefined;
  private userName: string = '';
  private jwtToken: string | undefined;
  private temporaryCredentials: object | undefined;

  public async login(userName: string, password: string): Promise<Object | undefined> {
    try {
      const signInOutput: SignInOutput = await signIn({
        username: userName,
        password: password,
        options: {
          authFlowType: 'USER_PASSWORD_AUTH'
        }
      });

      this.user = signInOutput;
      this.userName = userName;
      await this.generateIdToken();

      return this.user;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  public async getTemporaryCredentials() {
    if (this.temporaryCredentials) {
      return this.temporaryCredentials;
    }

    this.temporaryCredentials = await this.generateTemporaryCredentials();
    return this.temporaryCredentials;
  }

  private async generateTemporaryCredentials() {
    const idToken = this.getIdToken();
    const cognitoIdentityPool = `cognito-idp.${awsRegion}.amazonaws.com/us-east-1_rgHoEDiOP`;
    const cognitoIdentity = new CognitoIdentityClient({
      credentials: fromCognitoIdentityPool({
        clientConfig: {
          region: awsRegion
        },
        identityPoolId: 'us-east-1:8d2ddcad-078b-4ed1-9f4a-1461cfc52543',
        'logins': {
          [cognitoIdentityPool]: idToken!
        }
      })
    });

    const credentials = await cognitoIdentity.config.credentials();
    return credentials;
  }

  private async generateIdToken() {
    this.jwtToken = (await fetchAuthSession()).tokens?.idToken?.toString();
  }

  public getIdToken() {
    return this.jwtToken;
  }

  public getUserName() {
    return this.userName;
  }
}
