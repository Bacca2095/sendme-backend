import { Injectable } from '@nestjs/common';

import { AldeamoProviderAdapter } from '../adapters/aldeamo-provider.adapter';
import { MessageProviderAdapter } from '../adapters/message-provider.adapter';
import { JeSolutionsProviderAdapter } from '../adapters/theje-soluciones-provider.adapter';
import { TwilioProviderAdapter } from '../adapters/twilio-provider.adapter';

@Injectable()
export class ProviderFactoryService {
  private readonly adapters: Record<string, MessageProviderAdapter>;

  constructor(
    private readonly twilioAdapter: TwilioProviderAdapter,
    private readonly aldeamoAdapter: AldeamoProviderAdapter,
    private readonly jeSolutionsAdapter: JeSolutionsProviderAdapter,
  ) {
    this.adapters = {
      twilio: this.twilioAdapter,
      aldeamo: this.aldeamoAdapter,
      jesoluciones: this.jeSolutionsAdapter,
    };
  }

  getAdapter(providerName: string): MessageProviderAdapter {
    const adapter = this.adapters[providerName];
    if (!adapter) {
      throw new Error(`Adapter for provider "${providerName}" not found.`);
    }
    return adapter;
  }
}
