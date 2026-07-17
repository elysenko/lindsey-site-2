export declare enum LeadSort {
    NEWEST = "newest",
    OLDEST = "oldest"
}
export declare class ListLeadsDto {
    status?: string;
    challenge?: string;
    sort?: LeadSort;
    page?: number;
    pageSize?: number;
}
