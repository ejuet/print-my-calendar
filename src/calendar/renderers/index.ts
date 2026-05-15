import { monthTableRenderer } from "./month-table";

export const calendarRenderers = [monthTableRenderer];

export function getCalendarRendererById(rendererId: string) {
	return calendarRenderers.find((renderer) => renderer.id === rendererId) ?? calendarRenderers[0];
}
