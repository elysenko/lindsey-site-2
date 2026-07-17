import { HttpException } from '@nestjs/common';
export declare class ServiceUnconfiguredError extends HttpException {
    constructor(service: string);
}
