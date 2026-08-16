import { Body, Controller, Get, Headers, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PaymentStatus, Role } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ── Public ──────────────────────────────────────────────────────────────

  @Get('suggested-currency')
  suggestedCurrency(@Headers('x-vercel-ip-country') country?: string) {
    return this.paymentsService.getSuggestedCurrency(country);
  }

  // ── Members ─────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  checkout(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCheckoutDto) {
    return this.paymentsService.initiateCheckout(user.userId, dto);
  }

  // ── Admin ───────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin')
  listPayments(@Query('status') status?: PaymentStatus) {
    return this.paymentsService.listPayments(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/:id/mark-paid')
  markPaid(@Param('id') id: string, @Body() dto: MarkPaidDto, @CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.markPaid(id, user.userId, dto);
  }
}
