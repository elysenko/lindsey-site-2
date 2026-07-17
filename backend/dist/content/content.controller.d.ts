export declare class ContentController {
    services(): import("./services.data").ServiceOffering[];
    service(slug: string): {
        faqs: import("./faqs.data").Faq[];
        slug: string;
        name: string;
        tagline: string;
        summary: string;
        outcomes: string[];
        deliverables: string[];
    };
    faqs(category?: string): import("./faqs.data").Faq[];
}
