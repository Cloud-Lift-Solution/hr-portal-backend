import {
  UserProfileResponseDto,
  WorkFieldDto,
  JobTitleDto,
} from '../dto/user-profile-response.dto';

export class UserProfileMapper {
  /**
   * Map user entity to profile DTO
   */
  static toUserProfileDto(user: {
    id: string;
    email: string;
    name: string;
  }): UserProfileResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
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
