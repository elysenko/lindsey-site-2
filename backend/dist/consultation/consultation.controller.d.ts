import { Request } from 'express';
import { ConsultationService } from './consultation.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
export declare class ConsultationController {
    private readonly consultation;
    constructor(consultation: ConsultationService);
    create(dto: CreateConsultationDto, req: Request): Promise<{
        briefToken: string;
    }>;
}
