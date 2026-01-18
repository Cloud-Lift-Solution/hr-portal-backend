import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import {
  ClockInRequestDto,
  ClockInResponseDto,
  ClockOutRequestDto,
  BreakResponseDto,
  ClockOutResponseDto,
  TodayStatusResponseDto,
} from './dto';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Attendance')
@ApiBearerAuth('JWT-auth')
@Controller('attendance')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * Clock in for the day
   * POST /attendance/clock-in
   * Requires JWT authentication - employee ID extracted from token
   */
  @Post('clock-in')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Clock in for the day' })
  async clockIn(
    @CurrentUser() user: { id: string; email: string },
    @AcceptLanguage() lang: string,
    @Body() body: ClockInRequestDto,
  ): Promise<ClockInResponseDto> {
    return await this.attendanceService.clockIn(user.id, lang, body);
  }

  /**
   * Start a break
   * POST /attendance/start-break
   * Requires JWT authentication - employee ID extracted from token
   */
  @Post('start-break')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start a break' })
  async startBreak(
    @CurrentUser() user: { id: string; email: string },
    @AcceptLanguage() lang: string,
  ): Promise<BreakResponseDto> {
    return await this.attendanceService.startBreak(user.id, lang);
  }

  /**
   * End current break
   * POST /attendance/end-break
   * Requires JWT authentication - employee ID extracted from token
   */
  @Post('end-break')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'End current break' })
  async endBreak(
    @CurrentUser() user: { id: string; email: string },
    @AcceptLanguage() lang: string,
  ): Promise<BreakResponseDto> {
    return await this.attendanceService.endBreak(user.id, lang);
  }

  /**
   * Clock out for the day
   * POST /attendance/clock-out
   * Requires JWT authentication - employee ID extracted from token
   */
  @Post('clock-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clock out for the day' })
  async clockOut(
    @CurrentUser() user: { id: string; email: string },
    @AcceptLanguage() lang: string,
    @Body() body: ClockOutRequestDto,
  ): Promise<ClockOutResponseDto> {
    return await this.attendanceService.clockOut(user.id, lang, body);
  }

  /**
   * Get today's attendance status
   * GET /attendance/today
   * Requires JWT authentication - employee ID extracted from token
   */
  @Get('today')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get today's attendance status" })
  async getTodayStatus(
    @CurrentUser() user: { id: string; email: string },
    @AcceptLanguage() lang: string,
  ): Promise<TodayStatusResponseDto> {
    return await this.attendanceService.getTodayStatus(user.id, lang);
  }
}
