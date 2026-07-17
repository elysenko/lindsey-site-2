import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
export declare class SettingsController {
    private readonly settings;
    constructor(settings: SettingsService);
    list(): Promise<import("./settings.service").SettingView[]>;
    update(dto: UpdateSettingsDto): Promise<{
        updated: number;
    }>;
}
