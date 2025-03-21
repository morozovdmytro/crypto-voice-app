import { Controller, Get, Logger } from '@nestjs/common';

@Controller({
  version: '1',
  path: 'health',
})
export class HealthController {
  private readonly logger = new Logger(HealthController.name, {
    timestamp: true,
  });

  @Get()
  getHealth(): string {
    this.logger.log('Checking health');
    return 'OK';
  }
}
