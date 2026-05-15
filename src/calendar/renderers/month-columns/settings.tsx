import React from "react";
import { Form } from "react-bootstrap";
import { FontFamilySelect } from "../../components/font-family-select";
import { RendererSettingsProps } from "../types";

export type MonthColumnsBarStyle = "capped" | "continuous";

export type MonthColumnsRendererSettings = {
	fontFamily: string;
	barStyle: MonthColumnsBarStyle;
};

export const defaultMonthColumnsRendererSettings: MonthColumnsRendererSettings = {
	fontFamily: "Arial",
	barStyle: "capped",
};

export function MonthColumnsSettings({ settings, setSettings }: RendererSettingsProps<MonthColumnsRendererSettings>) {
	return (
		<>
			<h3>Display Settings</h3>

			<div className="d-flex justify-content-center" style={{ gap: 10, margin: 7 }}>
				<h2>Font:</h2>
				<FontFamilySelect value={settings.fontFamily} onChange={(fontFamily) => setSettings((old) => ({ ...old, fontFamily }))} />
			</div>

			<div className="d-flex justify-content-center align-items-center" style={{ gap: 10, margin: 7 }}>
				<h2>Bar Style:</h2>
				<Form.Select
					value={settings.barStyle}
					style={{ width: 220 }}
					onChange={(e) => setSettings((old) => ({ ...old, barStyle: e.target.value as MonthColumnsBarStyle }))}
				>
					<option value="capped">Marked start & end</option>
					<option value="continuous">Continuous</option>
				</Form.Select>
			</div>
		</>
	);
}
