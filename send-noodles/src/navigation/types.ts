export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Main: undefined;
  SnapReview: { photoUri?: string } | undefined;
  CircleDetail: { circleId?: string } | undefined;
  ChallengeSetup: { circleId: string };
  Members: { circleId: string };
  Memories: undefined;
  MemoryDetail: { snapId: string };
  ChooseFrame: { snapId: string };
};
