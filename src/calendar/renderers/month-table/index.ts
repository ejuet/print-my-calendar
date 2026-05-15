import { downloadAsPDF } from "../../lib/export";
import { defineRenderer, RendererPreviewProps } from "../types";
import { MonthTablePreview } from "./renderer";
import { defaultMonthTableRendererSettings, MonthTableRendererSettings, MonthTableSettings } from "./settings";

async function saveMonthTablePdf({ startOfCalendar, endOfCalendar }: RendererPreviewProps<MonthTableRendererSettings>) {
	return downloadAsPDF(startOfCalendar, endOfCalendar);
}

export const monthTableRenderer = defineRenderer<MonthTableRendererSettings>({
	id: "month-table",
	name: "Monthly Table",
	createDefaultSettings: () => ({ ...defaultMonthTableRendererSettings }),
	PreviewComponent: MonthTablePreview,
	SettingsComponent: MonthTableSettings,
	savePdf: saveMonthTablePdf,
});
