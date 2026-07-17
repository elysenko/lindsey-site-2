export declare enum LeadStatusDto {
    NEW = "NEW",
    CONTACTED = "CONTACTED",
    QUALIFIED = "QUALIFIED",
    WON = "WON",
    LOST = "LOST"
}
declare const BRIEF_FIELDS: readonly ["mission", "vision", "differentiator", "brandStory", "audiences", "brandVoice", "successDefinition"];
export declare class UpdateLeadDto {
    leadStatus?: LeadStatusDto;
    note?: string;
    briefEdits?: Partial<Record<(typeof BRIEF_FIELDS)[number], string>>;
}
export declare const EDITABLE_BRIEF_FIELDS: readonly ["mission", "vision", "differentiator", "brandStory", "audiences", "brandVoice", "successDefinition"];
export {};
