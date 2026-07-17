export interface ServiceOffering {
    slug: string;
    name: string;
    tagline: string;
    summary: string;
    outcomes: string[];
    deliverables: string[];
}
export declare const SERVICES: ServiceOffering[];
export declare function findService(slug: string): ServiceOffering | undefined;
