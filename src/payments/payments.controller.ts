import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { PaymentStatus, Role } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { validateSslcommerzPayment } from './sslcommerz';
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

  // ── SSLCommerz callbacks ────────────────────────────────────────────────
  // Called directly by SSLCommerz (browser-redirect POST for the three
  // below, server-to-server for ipn) — never by the frontend SPA, so no JWT
  // guard. success/ipn both validate via SSLCommerz's Validation API before
  // trusting the callback; handleGatewaySuccess is idempotent so it's safe
  // for both to fire for the same transaction.

  @Post('sslcommerz/success')
  async sslcommerzSuccess(
    @Body() body: Record<string, string>,
    @Res() res: Response,
  ) {
    const webAppUrl = process.env.WEB_APP_URL ?? '';
    const tranId = body.tran_id;
    const validation =
      tranId && body.val_id
        ? await validateSslcommerzPayment(body.val_id)
        : { valid: false };

    if (!tranId || !validation.valid) {
      return res.redirect(`${webAppUrl}/payment/failed`);
    }
    await this.paymentsService.handleGatewaySuccess(tranId, body.bank_tran_id);
    return res.redirect(`${webAppUrl}/payment/success`);
  }

  @Post('sslcommerz/fail')
  async sslcommerzFail(@Body('tran_id') tranId: string, @Res() res: Response) {
    if (tranId) await this.paymentsService.handleGatewayFail(tranId);
    return res.redirect(`${process.env.WEB_APP_URL ?? ''}/payment/failed`);
  }

  @Post('sslcommerz/cancel')
  async sslcommerzCancel(
    @Body('tran_id') tranId: string,
    @Res() res: Response,
  ) {
    if (tranId) await this.paymentsService.handleGatewayCancel(tranId);
    return res.redirect(`${process.env.WEB_APP_URL ?? ''}/payment/cancelled`);
  }

  @Post('sslcommerz/ipn')
  async sslcommerzIpn(@Body() body: Record<string, string>) {
    const tranId = body.tran_id;
    if (!tranId || !body.val_id) return { ok: false };

    const validation = await validateSslcommerzPayment(body.val_id);
    if (validation.valid) {
      await this.paymentsService.handleGatewaySuccess(
        tranId,
        body.bank_tran_id,
      );
    }
    return { ok: true };
  }

  // ── Members ─────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  checkout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCheckoutDto,
  ) {
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
  markPaid(
    @Param('id') id: string,
    @Body() dto: MarkPaidDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.paymentsService.markPaid(id, user.userId, dto);
  }
}
