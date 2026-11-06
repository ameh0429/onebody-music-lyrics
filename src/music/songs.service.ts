import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import { Album, Artiste, Song } from '../database/models';
import { CreateSongDto, UpdateSongDto } from './music.dto';

@Injectable()
export class SongsService {
  constructor(
    @InjectModel(Song) private readonly songs: typeof Song,
    @InjectModel(Artiste) private readonly artistes: typeof Artiste,
    @InjectModel(Album) private readonly albums: typeof Album,
    @InjectConnection() private readonly db: Sequelize,
  ) {}
  private readonly include = [
    { model: Artiste, as: 'mainArtiste' },
    { model: Artiste, as: 'featuredArtistes', through: { attributes: [] } },
    { model: Album, as: 'album' },
  ];
  async findAll() {
    const data = await this.songs.findAll({
      include: this.include,
      order: [['createdAt', 'DESC']],
    });
    return { success: true, count: data.length, data };
  }
  async findOne(id: number) {
    const data = await this.songs.findByPk(id, { include: this.include });
    if (!data) throw new NotFoundException('Song not found');
    return { success: true, data };
  }
  private async validateRelations(
    mainId: number,
    featuredIds: number[],
    albumId: number | null | undefined,
    transaction: Transaction,
  ) {
    if (featuredIds.includes(mainId))
      throw new BadRequestException('Main artiste cannot also be a featured artiste');
    const ids = [mainId, ...featuredIds];
    if ((await this.artistes.count({ where: { id: ids }, transaction })) !== ids.length)
      throw new NotFoundException('One or more artistes not found');
    if (albumId != null && !(await this.albums.findByPk(albumId, { transaction })))
      throw new NotFoundException('Album not found');
  }
  async create(dto: CreateSongDto, image?: string) {
    const id = await this.db.transaction(async (transaction) => {
      await this.validateRelations(
        dto.artisteId,
        dto.featuredArtisteIds ?? [],
        dto.albumId,
        transaction,
      );
      const { featuredArtisteIds, ...values } = dto;
      const song = await this.songs.create({ ...values, image: image ?? null }, { transaction });
      await song.$set('featuredArtistes', featuredArtisteIds ?? [], { transaction });
      return song.id as number;
    });
    return { ...(await this.findOne(id)), message: 'Song created successfully' };
  }
  async update(id: number, dto: UpdateSongDto, image?: string) {
    await this.db.transaction(async (transaction) => {
      const song = await this.songs.findByPk(id, { transaction });
      if (!song) throw new NotFoundException('Song not found');
      const featured =
        dto.featuredArtisteIds ??
        ((await song.$get('featuredArtistes', { transaction })) as Artiste[]).map(
          (a) => a.id as number,
        );
      await this.validateRelations(
        dto.artisteId ?? song.artisteId,
        featured,
        dto.albumId === undefined ? song.albumId : dto.albumId,
        transaction,
      );
      const { featuredArtisteIds, ...values } = dto;
      await song.update({ ...values, ...(image ? { image } : {}) }, { transaction });
      if (featuredArtisteIds !== undefined)
        await song.$set('featuredArtistes', featuredArtisteIds, { transaction });
    });
    return { ...(await this.findOne(id)), message: 'Song updated successfully' };
  }
  async remove(id: number) {
    const song = await this.songs.findByPk(id);
    if (!song) throw new NotFoundException('Song not found');
    await song.destroy();
    return { success: true, message: 'Song deleted successfully' };
  }
}
