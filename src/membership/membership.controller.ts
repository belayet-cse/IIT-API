import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { MembershipTier, Role } from '@prisma/client';
import { MembershipService } from './membership.service';
import { UpdateMembershipPlanDto } from './dto/update-membership-plan.dto';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { ExpressInterestDto } from './dto/express-interest.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';

@Controller('membership')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  // ── Public ──────────────────────────────────────────────────────────────

  @Get('plans')
  getPlans() {
    return this.membershipService.getPlans();
  }

  // ── Members ─────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('calculate-price')
  calculatePrice(@CurrentUser() user: AuthenticatedUser, @Body() dto: CalculatePriceDto) {
    return this.membershipService.calculatePrice(user.userId, dto.price);
  }

  @UseGuards(JwtAuthGuard)
  @Post('express-interest')
  expressInterest(@CurrentUser() user: AuthenticatedUser, @Body() dto: ExpressInterestDto) {
    return this.membershipService.expressInterest(user.userId, dto);
  }

  // ── Admin ───────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/plans/:tier')
  updatePlan(@Param('tier') tier: MembershipTier, @Body() dto: UpdateMembershipPlanDto) {
    return this.membershipService.updatePlan(tier as 'BASIC' | 'PRO' | 'ELITE', dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/run-expiry-check')
  runExpiryCheck() {
    return this.membershipService.runExpiryCheck();
  }
}
