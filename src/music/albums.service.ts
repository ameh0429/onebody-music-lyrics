import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import { Album, Artiste, Song } from '../database/models';
import { CreateAlbumDto, UpdateAlbumDto } from './music.dto';

@Injectable()
export class AlbumsService {
  constructor(
    @InjectModel(Album) private readonly albums: typeof Album,
    @InjectModel(Artiste) private readonly artistes: typeof Artiste,
    @InjectConnection() private readonly db: Sequelize,
  ) {}
  private readonly artistesInclude = {
    model: Artiste,
    as: 'artistes',
    through: { attributes: [] },
  };
  private async checkArtistes(ids: number[], transaction: Transaction) {
    if ((await this.artistes.count({ where: { id: ids }, transaction })) !== ids.length)
      throw new NotFoundException('One or more artistes not found');
  }
  async findAll() {
    const data = await this.albums.findAll({
      include: [this.artistesInclude],
      order: [['createdAt', 'DESC']],
    });
    return { success: true, count: data.length, data };
  }
  async findOne(id: number) {
    const data = await this.albums.findByPk(id, {
      include: [
        this.artistesInclude,
        {
          model: Song,
          as: 'songs',
          include: [
            { model: Artiste, as: 'mainArtiste' },
            { model: Artiste, as: 'featuredArtistes', through: { attributes: [] } },
          ],
        },
      ],
    });
    if (!data) throw new NotFoundException('Album not found');
    return { success: true, data };
  }
  async create(dto: CreateAlbumDto, image?: string) {
    const id = await this.db.transaction(async (transaction) => {
      await this.checkArtistes(dto.artisteIds, transaction);
      const album = await this.albums.create(
        { name: dto.name, releaseYear: dto.releaseYear, image: image ?? null },
        { transaction },
      );
      await album.$set('artistes', dto.artisteIds, { transaction });
      return album.id as number;
    });
    return { ...(await this.findOne(id)), message: 'Album created successfully' };
  }
  async update(id: number, dto: UpdateAlbumDto, image?: string) {
    await this.db.transaction(async (transaction) => {
      const album = await this.albums.findByPk(id, { transaction });
      if (!album) throw new NotFoundException('Album not found');
      if (dto.artisteIds !== undefined) {
        await this.checkArtistes(dto.artisteIds, transaction);
        await album.$set('artistes', dto.artisteIds, { transaction });
      }
      const { artisteIds, ...values } = dto;
      await album.update({ ...values, ...(image ? { image } : {}) }, { transaction });
    });
    return { ...(await this.findOne(id)), message: 'Album updated successfully' };
  }
  async remove(id: number) {
    const album = await this.albums.findByPk(id);
    if (!album) throw new NotFoundException('Album not found');
    await album.destroy();
    return { success: true, message: 'Album deleted successfully' };
  }
}
