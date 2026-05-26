import { downloadAsPDF } from "../../lib/export";
import { LEGEND_PAGE_ID } from "../legend";
import { defineRenderer, RendererPreviewProps } from "../types";
import { MonthTablePreview } from "./renderer";
import { defaultMonthTableRendererSettings, MonthTableRendererSettings, MonthTableSettings } from "./settings";

async function saveMonthTablePdf({ startOfCalendar, endOfCalendar }: RendererPreviewProps<MonthTableRendererSettings>) {
	return downloadAsPDF(startOfCalendar, endOfCalendar, [LEGEND_PAGE_ID]);
}

export const monthTableRenderer = defineRenderer<MonthTableRendererSettings>({
	id: "month-table",
	name: "Monthly Table",
	createDefaultSettings: () => ({ ...defaultMonthTableRendererSettings }),
	PreviewComponent: MonthTablePreview,
	SettingsComponent: MonthTableSettings,
	savePdf: saveMonthTablePdf,
});
