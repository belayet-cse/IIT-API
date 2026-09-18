"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const payments_service_1 = require("./payments.service");
const create_checkout_dto_1 = require("./dto/create-checkout.dto");
const mark_paid_dto_1 = require("./dto/mark-paid.dto");
const sslcommerz_1 = require("./sslcommerz");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    suggestedCurrency(country) {
        return this.paymentsService.getSuggestedCurrency(country);
    }
    async sslcommerzSuccess(body, res) {
        const webAppUrl = process.env.WEB_APP_URL ?? '';
        const tranId = body.tran_id;
        const validation = tranId && body.val_id
            ? await (0, sslcommerz_1.validateSslcommerzPayment)(body.val_id)
            : { valid: false };
        if (!tranId || !validation.valid) {
            return res.redirect(`${webAppUrl}/payment/failed`);
        }
        await this.paymentsService.handleGatewaySuccess(tranId, body.bank_tran_id);
        return res.redirect(`${webAppUrl}/payment/success`);
    }
    async sslcommerzFail(tranId, res) {
        if (tranId)
            await this.paymentsService.handleGatewayFail(tranId);
        return res.redirect(`${process.env.WEB_APP_URL ?? ''}/payment/failed`);
    }
    async sslcommerzCancel(tranId, res) {
        if (tranId)
            await this.paymentsService.handleGatewayCancel(tranId);
        return res.redirect(`${process.env.WEB_APP_URL ?? ''}/payment/cancelled`);
    }
    async sslcommerzIpn(body) {
        const tranId = body.tran_id;
        if (!tranId || !body.val_id)
            return { ok: false };
        const validation = await (0, sslcommerz_1.validateSslcommerzPayment)(body.val_id);
        if (validation.valid) {
            await this.paymentsService.handleGatewaySuccess(tranId, body.bank_tran_id);
        }
        return { ok: true };
    }
    checkout(user, dto) {
        return this.paymentsService.initiateCheckout(user.userId, dto);
    }
    listPayments(status) {
        return this.paymentsService.listPayments(status);
    }
    markPaid(id, dto, user) {
        return this.paymentsService.markPaid(id, user.userId, dto);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Get)('suggested-currency'),
    __param(0, (0, common_1.Headers)('x-vercel-ip-country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "suggestedCurrency", null);
__decorate([
    (0, common_1.Post)('sslcommerz/success'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "sslcommerzSuccess", null);
__decorate([
    (0, common_1.Post)('sslcommerz/fail'),
    __param(0, (0, common_1.Body)('tran_id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "sslcommerzFail", null);
__decorate([
    (0, common_1.Post)('sslcommerz/cancel'),
    __param(0, (0, common_1.Body)('tran_id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "sslcommerzCancel", null);
__decorate([
    (0, common_1.Post)('sslcommerz/ipn'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "sslcommerzIpn", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('checkout'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_checkout_dto_1.CreateCheckoutDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "checkout", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Get)('admin'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "listPayments", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Patch)('admin/:id/mark-paid'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, mark_paid_dto_1.MarkPaidDto, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "markPaid", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map