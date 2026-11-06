import { ApiProperty } from '@nestjs/swagger';
import { IsByteLength, IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({ example: 'Jane Doe', maxLength: 255 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;
  @ApiProperty({ example: 'jane@example.com', maxLength: 255 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(255)
  email!: string;
  @ApiProperty({ minLength: 6, maxLength: 72, format: 'password' })
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  @IsByteLength(6, 72)
  password!: string;
}
export class LoginDto {
  @ApiProperty({ example: 'jane@example.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email!: string;
  @ApiProperty({ format: 'password' }) @IsString() @IsNotEmpty() password!: string;
}
export class UpdatePasswordDto {
  @ApiProperty({ format: 'password' }) @IsString() @IsNotEmpty() currentPassword!: string;
  @ApiProperty({ minLength: 6, maxLength: 72, format: 'password' })
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  @IsByteLength(6, 72)
  newPassword!: string;
}
