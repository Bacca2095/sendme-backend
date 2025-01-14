import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { MetricsModule } from '@/metrics/metrics.module';
import { AsyncContextMiddleware } from '@/shared/middleware/async-context.middleware';
import { CorrelationIdMiddleware } from '@/shared/middleware/correlation-id.middleware';
import { SharedModule } from '@/shared/shared.module';

import { CampaignModule } from './campaigns/campaign.module';
import { ContactModule } from './contacts/contact.module';
import { CustomFieldsModule } from './custom-fields/custom-fields.module';
import { OrganizationModule } from './organizations/organization.module';
import { PermissionModule } from './permissions/permission.module';
import { PlanModule } from './plans/plan.module';
import { RoleModule } from './roles/role.module';
import { SubscriptionModule } from './subscriptions/subscription.module';
import { UserModule } from './users/user.module';

@Module({
  imports: [
    SharedModule,
    MetricsModule,
    UserModule,
    OrganizationModule,
    CustomFieldsModule,
    ContactModule,
    CampaignModule,
    RoleModule,
    PermissionModule,
    SubscriptionModule,
    PlanModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
    consumer.apply(AsyncContextMiddleware).forRoutes('*');
  }
}
