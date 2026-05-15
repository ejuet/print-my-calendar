import React from "react";
import { FontFamilySelect } from "../../components/font-family-select";
import { RendererSettingsProps } from "../types";

export type MonthColumnsRendererSettings = {
	fontFamily: string;
};

export const defaultMonthColumnsRendererSettings: MonthColumnsRendererSettings = {
	fontFamily: "Arial",
};

export function MonthColumnsSettings({ settings, setSettings }: RendererSettingsProps<MonthColumnsRendererSettings>) {
	return (
		<>
			<h3>Display Settings</h3>

			<div className="d-flex justify-content-center" style={{ gap: 10, margin: 7 }}>
				<h2>Font:</h2>
				<FontFamilySelect value={settings.fontFamily} onChange={(fontFamily) => setSettings((old) => ({ ...old, fontFamily }))} />
			</div>
		</>
	);
}
