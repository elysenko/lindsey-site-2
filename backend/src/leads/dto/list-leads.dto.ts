import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum LeadSort {
  NEWEST = 'newest',
  OLDEST = 'oldest',
}

export class ListLeadsDto {
  @ApiPropertyOptional({
    enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by challenge category' })
  @IsOptional()
  @IsString()
  challenge?: string;

  @ApiPropertyOptional({ enum: LeadSort, default: LeadSort.NEWEST })
  @IsOptional()
  @IsEnum(LeadSort)
  sort?: LeadSort = LeadSort.NEWEST;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}
