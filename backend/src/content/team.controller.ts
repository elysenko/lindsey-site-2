import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('team')
@Controller('team')
export class TeamController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List team members' })
  list() {
    return this.prisma.teamMember.findMany({ orderBy: { createdAt: 'asc' } });
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Team member by slug (Person JSON-LD source)' })
  async get(@Param('slug') slug: string) {
    const member = await this.prisma.teamMember.findUnique({ where: { slug } });
    if (!member) throw new NotFoundException('Team member not found');
    return member;
  }
}
