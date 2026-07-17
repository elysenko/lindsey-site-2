export interface Faq {
    question: string;
    answer: string;
    category: string;
    serviceSlug?: string;
}
export declare const FAQS: Faq[];
export declare function faqsForService(slug: string): Faq[];
export declare function faqCategories(): string[];
