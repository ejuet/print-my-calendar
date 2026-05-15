import { monthColumnsRenderer } from "./month-columns";
import { monthTableRenderer } from "./month-table";

export const calendarRenderers = [monthColumnsRenderer, monthTableRenderer];

export function getCalendarRendererById(rendererId: string) {
	return calendarRenderers.find((renderer) => renderer.id === rendererId) ?? calendarRenderers[0];
}
