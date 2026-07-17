export declare enum PostStatusDto {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED"
}
export declare class ListInsightsDto {
    page?: number;
    pageSize?: number;
}
export declare class CreateInsightDto {
    title: string;
    body: string;
    slug?: string;
    status?: PostStatusDto;
}
export declare class UpdateInsightDto {
    title?: string;
    body?: string;
    slug?: string;
    status?: PostStatusDto;
}
