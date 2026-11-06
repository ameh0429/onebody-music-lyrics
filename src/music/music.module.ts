import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Album, Artiste, Song } from '../database/models';
import { AuthModule } from '../auth/auth.module';
import { ArtistesController } from './artistes.controller';
import { AlbumsController } from './albums.controller';
import { SongsController } from './songs.controller';
import { ArtistesService } from './artistes.service';
import { AlbumsService } from './albums.service';
import { SongsService } from './songs.service';

@Module({
  imports: [AuthModule, SequelizeModule.forFeature([Artiste, Album, Song])],
  controllers: [ArtistesController, AlbumsController, SongsController],
  providers: [ArtistesService, AlbumsService, SongsService],
})
export class MusicModule {}
