import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

const parseArray = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};
export class CreateArtisteDto {
  @ApiProperty({ example: 'Ada Ehi', maxLength: 255 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;
  @ApiPropertyOptional({ example: 'Gospel singer', nullable: true })
  @IsOptional()
  @IsString()
  desc?: string | null;
}
export class UpdateArtisteDto extends PartialType(CreateArtisteDto, {
  skipNullProperties: false,
}) {}
export class CreateAlbumDto {
  @ApiProperty({ example: 'Born of God', maxLength: 255 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;
  @ApiPropertyOptional({
    example: 2020,
    minimum: 1900,
    maximum: new Date().getFullYear() + 1,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  releaseYear?: number | null;
  @ApiProperty({
    type: [Number],
    example: [1],
    description: 'Existing artiste IDs. For multipart requests, send a JSON array string.',
  })
  @Transform(parseArray)
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  artisteIds!: number[];
}
export class UpdateAlbumDto extends PartialType(CreateAlbumDto, { skipNullProperties: false }) {}
export class CreateSongDto {
  @ApiProperty({ example: 'Only You Jesus', maxLength: 255 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;
  @ApiProperty({ example: 1, description: 'Main artiste ID' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  artisteId!: number;
  @ApiPropertyOptional({
    example: 1,
    nullable: true,
    description: 'Set null to remove the album on update',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  albumId?: number | null;
  @ApiPropertyOptional({ example: 'Song lyrics...', nullable: true })
  @IsOptional()
  @IsString()
  lyrics?: string | null;
  @ApiPropertyOptional({
    type: [Number],
    example: [2],
    description:
      'Featured artiste IDs. For multipart, send a JSON array string. Empty array clears them on update.',
  })
  @ValidateIf((_object, value) => value !== undefined)
  @Transform(parseArray)
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  featuredArtisteIds?: number[];
}
export class UpdateSongDto extends PartialType(CreateSongDto, { skipNullProperties: false }) {}
