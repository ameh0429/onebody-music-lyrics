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
import { CreateSongDto, UpdateSongDto } from './music.dto';
import { SongsService } from './songs.service';

@ApiTags('Songs')
@ApiExtraModels(CreateSongDto, UpdateSongDto)
@Controller('api/songs')
export class SongsController {
  constructor(private readonly service: SongsService) {}
  @Get()
  @ApiOperation({ summary: 'List songs' })
  findAll() {
    return this.service.findAll();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get song and related music' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create song' })
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    schema: {
      allOf: [
        { $ref: getSchemaPath(CreateSongDto) },
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
  create(@Body() dto: CreateSongDto, @UploadedFile() file?: Express.Multer.File) {
    return this.service.create(dto, file ? `/uploads/${file.filename}` : undefined);
  }
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update song' })
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    schema: {
      allOf: [
        { $ref: getSchemaPath(UpdateSongDto) },
        { type: 'object', properties: { image: { type: 'string', format: 'binary' } } },
      ],
    },
  })
  @UseInterceptors(UploadCleanupInterceptor, FileInterceptor('image', imageUploadOptions))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSongDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.update(id, dto, file ? `/uploads/${file.filename}` : undefined);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete song' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
