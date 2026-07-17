import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SERVICES, findService } from './services.data';
import { FAQS, faqsForService } from './faqs.data';

@ApiTags('content')
@Controller()
export class ContentController {
  @Get('services')
  @ApiOperation({ summary: 'List all service offerings' })
  services() {
    return SERVICES;
  }

  @Get('services/:slug')
  @ApiOperation({ summary: 'Service detail with its embedded FAQs' })
  service(@Param('slug') slug: string) {
    const service = findService(slug);
    if (!service) throw new NotFoundException('Service not found');
    return { ...service, faqs: faqsForService(slug) };
  }

  @Get('faqs')
  @ApiOperation({ summary: 'List FAQs, optionally filtered by category' })
  faqs(@Query('category') category?: string) {
    if (category) {
      return FAQS.filter(
        (f) => f.category.toLowerCase() === category.toLowerCase(),
      );
    }
    return FAQS;
  }
}
