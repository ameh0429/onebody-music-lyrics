import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { imageUploadOptions } from '../common/upload';
import { UploadCleanupInterceptor } from '../common/upload-cleanup.interceptor';
import { CreateArtisteDto, UpdateArtisteDto } from './music.dto';
import { ArtistesService } from './artistes.service';

@ApiTags('Artistes')
@ApiExtraModels(CreateArtisteDto, UpdateArtisteDto)
@Controller('api/artistes')
export class ArtistesController {
  constructor(private readonly service: ArtistesService) {}
  @Get()
  @ApiOperation({ summary: 'List artistes' })
  findAll() {
    return this.service.findAll();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get artiste and related music' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create artiste' })
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    schema: {
      allOf: [
        { $ref: getSchemaPath(CreateArtisteDto) },
        {
          type: 'object',
          properties: {
            image: {
              type: 'string',
              format: 'binary',
              description: 'Optional image, maximum 5 MiB',
            },
          },
        },
      ],
    },
  })
  @UseInterceptors(UploadCleanupInterceptor, FileInterceptor('image', imageUploadOptions))
  create(@Body() dto: CreateArtisteDto, @UploadedFile() file?: Express.Multer.File) {
    return this.service.create(dto, file ? `/uploads/${file.filename}` : undefined);
  }
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update artiste' })
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    schema: {
      allOf: [
        { $ref: getSchemaPath(UpdateArtisteDto) },
        { type: 'object', properties: { image: { type: 'string', format: 'binary' } } },
      ],
    },
  })
  @UseInterceptors(UploadCleanupInterceptor, FileInterceptor('image', imageUploadOptions))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArtisteDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.update(id, dto, file ? `/uploads/${file.filename}` : undefined);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete artiste' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
