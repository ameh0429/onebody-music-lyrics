import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly db: Sequelize) {}
  @Get()
  @ApiOperation({ summary: 'Check API and database connectivity' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'OK' },
        message: { type: 'string', example: 'Onebody Music Lyrics API is running' },
      },
    },
  })
  async health() {
    await this.db.authenticate();
    return { status: 'OK', message: 'Onebody Music Lyrics API is running' };
  }
}
