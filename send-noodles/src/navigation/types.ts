export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Main: undefined;
  SnapReview: { photoUri?: string } | undefined;
  CircleDetail: { circleId?: string } | undefined;
  PersonalCircle: { circleId: string };
  ChallengeSetup: { circleId: string };
  Members: { circleId: string };
  Memories: undefined;
  MemoryDetail: { snapId: string };
  ChooseFrame: { snapId: string };
  CircleSnaps: { circleId: string; circleName?: string };
  CircleSnapDetail: { circleId: string; snapId: string };
};
