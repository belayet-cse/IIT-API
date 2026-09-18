"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./database/prisma.module");
const email_module_1 = require("./email/email.module");
const auth_module_1 = require("./auth/auth.module");
const alumni_module_1 = require("./alumni/alumni.module");
const blogs_module_1 = require("./blogs/blogs.module");
const admin_module_1 = require("./admin/admin.module");
const categories_module_1 = require("./categories/categories.module");
const subcategories_module_1 = require("./subcategories/subcategories.module");
const users_module_1 = require("./users/users.module");
const contact_module_1 = require("./contact/contact.module");
const researchers_module_1 = require("./researchers/researchers.module");
const membership_module_1 = require("./membership/membership.module");
const payments_module_1 = require("./payments/payments.module");
const forum_module_1 = require("./forum/forum.module");
const research_module_1 = require("./research/research.module");
const programs_module_1 = require("./programs/programs.module");
const events_module_1 = require("./events/events.module");
const partners_module_1 = require("./partners/partners.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            email_module_1.EmailModule,
            auth_module_1.AuthModule,
            alumni_module_1.AlumniModule,
            blogs_module_1.BlogsModule,
            admin_module_1.AdminModule,
            categories_module_1.CategoriesModule,
            subcategories_module_1.SubCategoriesModule,
            users_module_1.UsersModule,
            contact_module_1.ContactModule,
            researchers_module_1.ResearchersModule,
            membership_module_1.MembershipModule,
            payments_module_1.PaymentsModule,
            forum_module_1.ForumModule,
            research_module_1.ResearchModule,
            programs_module_1.ProgramsModule,
            events_module_1.EventsModule,
            partners_module_1.PartnersModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map