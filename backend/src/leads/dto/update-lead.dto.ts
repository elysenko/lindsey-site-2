import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum LeadStatusDto {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  WON = 'WON',
  LOST = 'LOST',
}

const BRIEF_FIELDS = [
  'mission',
  'vision',
  'differentiator',
  'brandStory',
  'audiences',
  'brandVoice',
  'successDefinition',
] as const;

export class UpdateLeadDto {
  @ApiPropertyOptional({ enum: LeadStatusDto })
  @IsOptional()
  @IsEnum(LeadStatusDto)
  leadStatus?: LeadStatusDto;

  @ApiPropertyOptional({ description: 'Append a note to the lead timeline' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  note?: string;

  @ApiPropertyOptional({
    description:
      'Partial brief-field edits. Each changed field is audited into BrandBriefAudit.',
    example: { mission: 'Updated mission text' },
  })
  @IsOptional()
  @IsObject()
  briefEdits?: Partial<Record<(typeof BRIEF_FIELDS)[number], string>>;
}

export const EDITABLE_BRIEF_FIELDS = BRIEF_FIELDS;
