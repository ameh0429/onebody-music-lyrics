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
import { CreateAlbumDto, UpdateAlbumDto } from './music.dto';
import { AlbumsService } from './albums.service';

@ApiTags('Albums')
@ApiExtraModels(CreateAlbumDto, UpdateAlbumDto)
@Controller('api/albums')
export class AlbumsController {
  constructor(private readonly service: AlbumsService) {}
  @Get()
  @ApiOperation({ summary: 'List albums' })
  findAll() {
    return this.service.findAll();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get album and related music' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create album' })
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    schema: {
      allOf: [
        { $ref: getSchemaPath(CreateAlbumDto) },
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
  create(@Body() dto: CreateAlbumDto, @UploadedFile() file?: Express.Multer.File) {
    return this.service.create(dto, file ? `/uploads/${file.filename}` : undefined);
  }
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update album' })
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    schema: {
      allOf: [
        { $ref: getSchemaPath(UpdateAlbumDto) },
        { type: 'object', properties: { image: { type: 'string', format: 'binary' } } },
      ],
    },
  })
  @UseInterceptors(UploadCleanupInterceptor, FileInterceptor('image', imageUploadOptions))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAlbumDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.update(id, dto, file ? `/uploads/${file.filename}` : undefined);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete album' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
