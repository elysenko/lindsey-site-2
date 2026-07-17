import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateInsightDto,
  ListInsightsDto,
  PostStatusDto,
  UpdateInsightDto,
} from './dto/insights.dto';

const MIN_WORDS = 1500;

@Injectable()
export class InsightsService {
  constructor(private readonly prisma: PrismaService) {}

  private wordCount(body: string): number {
    return body.trim().split(/\s+/).filter(Boolean).length;
  }

  private slugify(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120);
  }

  private excerpt(body: string, words = 40): string {
    return body.trim().split(/\s+/).slice(0, words).join(' ');
  }

  // ── Public ────────────────────────────────────────────────────────────────

  async listPublished(query: ListInsightsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where: Prisma.InsightsPostWhereInput = { status: 'PUBLISHED' };

    const [total, posts] = await this.prisma.$transaction([
      this.prisma.insightsPost.count({ where }),
      this.prisma.insightsPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          slug: true,
          title: true,
          body: true,
          publishedAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      items: posts.map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: this.excerpt(p.body),
        publishedAt: p.publishedAt,
        updatedAt: p.updatedAt,
      })),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async getPublishedBySlug(slug: string) {
    const post = await this.prisma.insightsPost.findFirst({
      where: { slug, status: 'PUBLISHED' },
      include: { author: { select: { email: true } } },
    });
    if (!post) throw new NotFoundException('Insight not found');
    return post;
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  async adminList() {
    return this.prisma.insightsPost.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
      },
    });
  }

  async adminGet(id: string) {
    const post = await this.prisma.insightsPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Insight not found');
    return post;
  }

  private assertPublishable(body: string): void {
    const words = this.wordCount(body);
    if (words < MIN_WORDS) {
      throw new BadRequestException(
        `Published insights must be at least ${MIN_WORDS} words (current: ${words}).`,
      );
    }
  }

  async create(dto: CreateInsightDto, authorId: string) {
    const status = dto.status ?? PostStatusDto.DRAFT;
    if (status === PostStatusDto.PUBLISHED) {
      this.assertPublishable(dto.body);
    }

    const slug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.title);
    await this.assertSlugFree(slug);

    return this.prisma.insightsPost.create({
      data: {
        title: dto.title,
        body: dto.body,
        slug,
        status,
        authorId,
        publishedAt: status === PostStatusDto.PUBLISHED ? new Date() : null,
      },
    });
  }

  async update(id: string, dto: UpdateInsightDto) {
    const existing = await this.prisma.insightsPost.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Insight not found');

    const nextStatus = dto.status ?? existing.status;
    const nextBody = dto.body ?? existing.body;

    if (nextStatus === 'PUBLISHED') {
      this.assertPublishable(nextBody);
    }

    const data: Prisma.InsightsPostUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.body !== undefined) data.body = dto.body;
    if (dto.slug !== undefined) {
      const slug = this.slugify(dto.slug);
      if (slug !== existing.slug) {
        await this.assertSlugFree(slug, id);
      }
      data.slug = slug;
    }
    if (dto.status !== undefined) data.status = dto.status;

    // Set publishedAt on first publish; publishing/editing bumps updatedAt
    // automatically via @updatedAt → drives sitemap lastmod.
    if (nextStatus === 'PUBLISHED' && !existing.publishedAt) {
      data.publishedAt = new Date();
    }

    return this.prisma.insightsPost.update({ where: { id }, data });
  }

  private async assertSlugFree(slug: string, exceptId?: string): Promise<void> {
    const clash = await this.prisma.insightsPost.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (clash && clash.id !== exceptId) {
      throw new ConflictException(`Slug "${slug}" is already in use.`);
    }
  }
}
