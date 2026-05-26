import { downloadAsPDF } from "../../lib/export";
import { LEGEND_PAGE_ID } from "../legend";
import { defineRenderer, RendererPreviewProps } from "../types";
import { MonthColumnsPreview } from "./renderer";
import { defaultMonthColumnsRendererSettings, MonthColumnsRendererSettings, MonthColumnsSettings } from "./settings";

async function saveMonthColumnsPdf({ startOfCalendar, endOfCalendar }: RendererPreviewProps<MonthColumnsRendererSettings>) {
	return downloadAsPDF(startOfCalendar, endOfCalendar, [LEGEND_PAGE_ID]);
}

export const monthColumnsRenderer = defineRenderer<MonthColumnsRendererSettings>({
	id: "month-columns",
	name: "Monthly Columns A4",
	createDefaultSettings: () => ({ ...defaultMonthColumnsRendererSettings }),
	PreviewComponent: MonthColumnsPreview,
	SettingsComponent: MonthColumnsSettings,
	savePdf: saveMonthColumnsPdf,
});
