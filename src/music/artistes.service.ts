import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Album, Artiste, Song } from '../database/models';
import { CreateArtisteDto, UpdateArtisteDto } from './music.dto';

@Injectable()
export class ArtistesService {
  constructor(@InjectModel(Artiste) private readonly artistes: typeof Artiste) {}
  async findAll() {
    const data = await this.artistes.findAll({ order: [['createdAt', 'DESC']] });
    return { success: true, count: data.length, data };
  }
  async findOne(id: number) {
    const data = await this.artistes.findByPk(id, {
      include: [
        { model: Album, as: 'albums', through: { attributes: [] } },
        { model: Song, as: 'mainSongs' },
        { model: Song, as: 'featuredSongs', through: { attributes: [] } },
      ],
    });
    if (!data) throw new NotFoundException('Artiste not found');
    return { success: true, data };
  }
  async create(dto: CreateArtisteDto, image?: string) {
    const data = await this.artistes.create({
      name: dto.name,
      desc: dto.desc,
      image: image ?? null,
    });
    return { success: true, message: 'Artiste created successfully', data };
  }
  async update(id: number, dto: UpdateArtisteDto, image?: string) {
    const data = await this.artistes.findByPk(id);
    if (!data) throw new NotFoundException('Artiste not found');
    await data.update({ ...dto, ...(image ? { image } : {}) });
    return { success: true, message: 'Artiste updated successfully', data };
  }
  async remove(id: number) {
    const data = await this.artistes.findByPk(id);
    if (!data) throw new NotFoundException('Artiste not found');
    await data.destroy();
    return { success: true, message: 'Artiste deleted successfully' };
  }
}
