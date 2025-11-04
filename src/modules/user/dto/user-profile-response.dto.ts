import {
  AgeRange,
  Gender,
  PreferredLanguage,
  ChallengeLevel,
} from '@prisma/client';

export class WorkFieldDto {
  id: string;
  name: string;
}

export class JobTitleDto {
  id: string;
  name: string;
}

export class UserProfileResponseDto {
  id: string;
  email: string;
  name: string;
  yearsOfExperience: string | null;
  cvFileKey: string | null;
  portfolioFileKey: string | null;
  age: AgeRange;
  gender: Gender;
  preferredLanguage: PreferredLanguage;
  sessionDuration: number | null;
  challengeLevel: ChallengeLevel | null;
  workField: WorkFieldDto | null;
  jobTitle: JobTitleDto | null;
  createdAt: Date;
  updatedAt: Date;
}
