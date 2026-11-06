import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  BelongsToMany,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import type { NonAttribute } from 'sequelize';
import * as bcrypt from 'bcrypt';

@Table({ tableName: 'artistes', timestamps: true })
export class Artiste extends Model {
  @Column({ type: DataType.STRING, allowNull: false }) declare name: string;
  @Column(DataType.STRING) declare image: string | null;
  @Column(DataType.TEXT) declare desc: string | null;
  @BelongsToMany(() => Album, () => AlbumArtiste) declare albums: NonAttribute<Album[]>;
  @HasMany(() => Song, 'artisteId') declare mainSongs: NonAttribute<Song[]>;
  @BelongsToMany(() => Song, () => SongFeaturedArtiste) declare featuredSongs: NonAttribute<Song[]>;
}

@Table({ tableName: 'albums', timestamps: true })
export class Album extends Model {
  @Column({ type: DataType.STRING, allowNull: false }) declare name: string;
  @Column(DataType.INTEGER) declare releaseYear: number | null;
  @Column(DataType.STRING) declare image: string | null;
  @BelongsToMany(() => Artiste, () => AlbumArtiste) declare artistes: NonAttribute<Artiste[]>;
  @HasMany(() => Song, 'albumId') declare songs: NonAttribute<Song[]>;
}

@Table({ tableName: 'songs', timestamps: true })
export class Song extends Model {
  @Column({ type: DataType.STRING, allowNull: false }) declare name: string;
  @ForeignKey(() => Artiste)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare artisteId: number;
  @ForeignKey(() => Album)
  @Column(DataType.INTEGER)
  declare albumId: number | null;
  @Column(DataType.TEXT) declare lyrics: string | null;
  @Column(DataType.STRING) declare image: string | null;
  @BelongsTo(() => Artiste, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  declare mainArtiste: NonAttribute<Artiste>;
  @BelongsTo(() => Album, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  declare album: NonAttribute<Album>;
  @BelongsToMany(() => Artiste, () => SongFeaturedArtiste) declare featuredArtistes: NonAttribute<
    Artiste[]
  >;
}

@Table({
  tableName: 'album_artistes',
  timestamps: true,
  indexes: [{ unique: true, fields: ['albumId', 'artisteId'] }],
})
export class AlbumArtiste extends Model {
  @ForeignKey(() => Album)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare albumId: number;
  @ForeignKey(() => Artiste)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare artisteId: number;
}

@Table({
  tableName: 'song_featured_artistes',
  timestamps: true,
  indexes: [{ unique: true, fields: ['songId', 'artisteId'] }],
})
export class SongFeaturedArtiste extends Model {
  @ForeignKey(() => Song)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare songId: number;
  @ForeignKey(() => Artiste)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare artisteId: number;
}

@Table({ tableName: 'users', timestamps: true })
export class User extends Model {
  @Column({ type: DataType.STRING, allowNull: false }) declare name: string;
  @Column({ type: DataType.STRING, allowNull: false, unique: true }) declare email: string;
  @Column({ type: DataType.STRING, allowNull: false }) declare password: string;
  @Column({ type: DataType.ENUM('user', 'admin'), defaultValue: 'user' }) declare role:
    | 'user'
    | 'admin';
  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(user: User) {
    if (user.changed('password')) user.password = await bcrypt.hash(user.password, 10);
  }
  comparePassword(password: string) {
    return bcrypt.compare(password, this.password);
  }
  override toJSON() {
    const { password, ...user } = this.get({ plain: true });
    return user;
  }
}

export const models = [Artiste, Album, Song, AlbumArtiste, SongFeaturedArtiste, User];
