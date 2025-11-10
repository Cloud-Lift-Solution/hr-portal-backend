import {
  Controller,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AllowanceSettingsService } from './allowance-settings.service';
import {
  UpdateAllowanceSettingsDto,
  AllowanceSettingsResponseDto,
} from './dto';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';

@ApiTags('Allowance Settings')
// @ApiBearerAuth('JWT-auth') // Uncomment when auth is ready for PUT endpoint
@Controller('allowance-settings')
@UseInterceptors(ClassSerializerInterceptor)
// @UseGuards(JwtAuthGuard) // Uncomment when auth is ready for PUT endpoint
export class AllowanceSettingsController {
  constructor(
    private readonly allowanceSettingsService: AllowanceSettingsService,
  ) {}

  /**
   * Get allowance settings
   * GET /allowance-settings
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get allowance settings',
    description:
      'Retrieve system-wide allowance settings. Returns default values if no settings exist.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Allowance settings retrieved successfully',
    type: AllowanceSettingsResponseDto,
  })
  async getSettings(): Promise<AllowanceSettingsResponseDto> {
    return await this.allowanceSettingsService.getSettings();
  }

  /**
   * Update allowance settings
   * PUT /allowance-settings
   */
  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update allowance settings',
    description:
      'Update system-wide allowance settings. Creates settings if they don\'t exist (singleton pattern). All fields are optional for partial updates.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Allowance settings updated successfully',
    type: AllowanceSettingsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Validation error: invalid IDs, conflicts between arrays, or duplicate IDs',
  })
  async updateSettings(
    @Body() updateDto: UpdateAllowanceSettingsDto,
    @AcceptLanguage() language: string,
  ): Promise<AllowanceSettingsResponseDto> {
    return await this.allowanceSettingsService.updateSettings(
      updateDto,
      language,
    );
  }
}

