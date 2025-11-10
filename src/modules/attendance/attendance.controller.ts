import {
  Controller,
  Get,
  Post,
  Put,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import {
  ClockInResponseDto,
  BreakResponseDto,
  ClockOutResponseDto,
  TodayStatusResponseDto,
  PeriodHoursResponseDto,
  AttendanceListResponseDto,
  MyHistoryResponseDto,
  AttendanceQueryDto,
  MyHistoryQueryDto,
  PeriodHoursQueryDto,
} from './dto';
import { AcceptLanguage } from '../../common/decorators/accept-language.decorator';
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'; // Uncomment when ready

@ApiTags('Attendance')
// @ApiBearerAuth('JWT-auth')
@Controller('attendance')
// @UseGuards(JwtAuthGuard) // Uncomment when ready
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * Clock in for today
   * POST /attendance/clock-in
   */
  @Post('clock-in')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Clock in for today' })
  async clockIn(
    @Request() req: any,
    @AcceptLanguage() language: string,
  ): Promise<ClockInResponseDto> {
    const employeeId = req.user?.id || 'test-employee-id'; // TODO: Get from JWT
    return await this.attendanceService.clockIn(employeeId, language);
  }

  /**
   * Take a break
   * POST /attendance/take-break
   */
  @Post('take-break')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Take a break' })
  async takeBreak(
    @Request() req: any,
    @AcceptLanguage() language: string,
  ): Promise<BreakResponseDto> {
    const employeeId = req.user?.id || 'test-employee-id'; // TODO: Get from JWT
    return await this.attendanceService.takeBreak(employeeId, language);
  }

  /**
   * Back to work from break
   * POST /attendance/back-to-work
   */
  @Post('back-to-work')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Back to work from break' })
  async backToWork(
    @Request() req: any,
    @AcceptLanguage() language: string,
  ): Promise<BreakResponseDto> {
    const employeeId = req.user?.id || 'test-employee-id'; // TODO: Get from JWT
    return await this.attendanceService.backToWork(employeeId, language);
  }

  /**
   * Clock out
   * PUT /attendance/clock-out
   */
  @Put('clock-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clock out for today' })
  async clockOut(
    @Request() req: any,
    @AcceptLanguage() language: string,
  ): Promise<ClockOutResponseDto> {
    const employeeId = req.user?.id || 'test-employee-id'; // TODO: Get from JWT
    return await this.attendanceService.clockOut(employeeId, language);
  }

  /**
   * Get today's attendance status
   * GET /attendance/today
   */
  @Get('today')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get today's attendance status" })
  async getTodayStatus(@Request() req: any): Promise<TodayStatusResponseDto> {
    const employeeId = req.user?.id || 'test-employee-id'; // TODO: Get from JWT
    return await this.attendanceService.getTodayStatus(employeeId);
  }

  /**
   * Get total working hours for a period
   * GET /attendance/total-hours?startDate=2024-09-01&endDate=2024-09-30
   */
  @Get('total-hours')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get total working hours for a period' })
  async getTotalHours(
    @Request() req: any,
    @Query() query: PeriodHoursQueryDto,
    @AcceptLanguage() language: string,
  ): Promise<PeriodHoursResponseDto> {
    const employeeId = req.user?.id || 'test-employee-id'; // TODO: Get from JWT
    return await this.attendanceService.getTotalHours(
      employeeId,
      query,
      language,
    );
  }

  /**
   * Get my attendance history
   * GET /attendance/my-history
   */
  @Get('my-history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get my attendance history' })
  async getMyHistory(
    @Request() req: any,
    @Query() query: MyHistoryQueryDto,
  ): Promise<MyHistoryResponseDto> {
    const employeeId = req.user?.id || 'test-employee-id'; // TODO: Get from JWT
    return await this.attendanceService.getMyHistory(employeeId, query);
  }

  /**
   * List all attendance records (admin)
   * GET /attendance/all
   */
  @Get('all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all attendance records (admin)' })
  async findAll(
    @Query() query: AttendanceQueryDto,
  ): Promise<AttendanceListResponseDto> {
    return await this.attendanceService.findAll(query);
  }
}
