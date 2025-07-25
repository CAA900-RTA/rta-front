export const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_S4DeYLq0j',
      userPoolClientId: '2d5hb25s6dumqunhf2fv10d09l',
      loginWith: {
        email: true,
        username: false,
      },
      signUpVerificationMethod: 'code' as const,
      userAttributes: {
        email: {
          required: true,
        },
      },
    },
  },
};