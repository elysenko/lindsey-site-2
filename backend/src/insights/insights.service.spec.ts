import { BadRequestException } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInsightDto, PostStatusDto } from './dto/insights.dto';

function build() {
  const prisma = {
    insightsPost: {
      create: jest.fn(async ({ data }: { data: unknown }) => data),
      findUnique: jest.fn().mockResolvedValue(null),
    },
  };
  const service = new InsightsService(prisma as unknown as PrismaService);
  return { service, prisma };
}

const longBody = Array.from({ length: 1500 }, () => 'word').join(' ');

describe('InsightsService publish word-count enforcement', () => {
  it('rejects publishing a body under 1500 words', async () => {
    const { service } = build();
    const dto: CreateInsightDto = {
      title: 'Too short',
      body: 'only a few words',
      status: PostStatusDto.PUBLISHED,
    };
    await expect(service.create(dto, 'author-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('allows publishing a body of >=1500 words', async () => {
    const { service, prisma } = build();
    const dto: CreateInsightDto = {
      title: 'Long enough',
      body: longBody,
      status: PostStatusDto.PUBLISHED,
    };
    const created = await service.create(dto, 'author-1');
    expect(prisma.insightsPost.create).toHaveBeenCalled();
    expect((created as { status: string }).status).toBe('PUBLISHED');
    expect((created as { publishedAt: Date | null }).publishedAt).toBeInstanceOf(
      Date,
    );
  });

  it('allows a short DRAFT (no word-count gate until publish)', async () => {
    const { service } = build();
    const dto: CreateInsightDto = { title: 'Draft', body: 'tiny' };
    await expect(service.create(dto, 'author-1')).resolves.toMatchObject({
      status: PostStatusDto.DRAFT,
      publishedAt: null,
    });
  });
});

describe('InsightsService slugify', () => {
  it('derives a URL-safe slug from the title when none is given', async () => {
    const { service, prisma } = build();
    await service.create({ title: 'Hello, World!', body: 'tiny' }, 'a1');
    const data = prisma.insightsPost.create.mock.calls[0][0].data;
    expect(data.slug).toBe('hello-world');
  });

  it('normalizes an explicit slug', async () => {
    const { service, prisma } = build();
    await service.create(
      { title: 'X', body: 'tiny', slug: '  Multiple   Spaces  ' },
      'a1',
    );
    const data = prisma.insightsPost.create.mock.calls[0][0].data;
    expect(data.slug).toBe('multiple-spaces');
  });
});
