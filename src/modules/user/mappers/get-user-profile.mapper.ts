import {
  UserProfileResponseDto,
  WorkFieldDto,
  JobTitleDto,
} from '../dto/user-profile-response.dto';
import {
  AgeRange,
  Gender,
  PreferredLanguage,
  ChallengeLevel,
} from '@prisma/client';

export class UserProfileMapper {
  /**
   * Map user entity to profile DTO
   */
  static toUserProfileDto(user: {
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
    createdAt: Date;
    updatedAt: Date;
    workField: {
      id: string;
      translations: Array<{ name: string }>;
    } | null;
    jobTitle: {
      id: string;
      translations: Array<{ name: string }>;
    } | null;
  }): UserProfileResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      yearsOfExperience: user.yearsOfExperience,
      cvFileKey: user.cvFileKey,
      portfolioFileKey: user.portfolioFileKey,
      age: user.age,
      gender: user.gender,
      preferredLanguage: user.preferredLanguage,

      sessionDuration: user.sessionDuration,
      challengeLevel: user.challengeLevel,
      workField: user.workField ? this.toWorkFieldDto(user.workField) : null,
      jobTitle: user.jobTitle ? this.toJobTitleDto(user.jobTitle) : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Map work field entity to DTO
   */
  private static toWorkFieldDto(workField: {
    id: string;
    translations: Array<{ name: string }>;
  }): WorkFieldDto {
    return {
      id: workField.id,
      name: this.extractTranslatedName(workField.translations),
    };
  }

  /**
   * Map job title entity to DTO
   */
  private static toJobTitleDto(jobTitle: {
    id: string;
    translations: Array<{ name: string }>;
  }): JobTitleDto {
    return {
      id: jobTitle.id,
      name: this.extractTranslatedName(jobTitle.translations),
    };
  }

  /**
   * Extract translated name from translations array
   * Returns empty string if no translation found
   */
  private static extractTranslatedName(
    translations: Array<{ name: string }>,
  ): string {
    return translations[0]?.name ?? '';
  }
}
