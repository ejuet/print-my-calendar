import React from "react";
import { Form } from "react-bootstrap";
import { fonts } from "../../lib/constants";
import { RendererSettingsProps } from "../types";

export type MonthColumnsRendererSettings = {
	fontFamily: string;
};

export const defaultMonthColumnsRendererSettings: MonthColumnsRendererSettings = {
	fontFamily: "Calibri",
};

export function MonthColumnsSettings({ settings, setSettings }: RendererSettingsProps<MonthColumnsRendererSettings>) {
	return (
		<>
			<h3>Display Settings</h3>

			<div className="d-flex justify-content-center" style={{ gap: 10, margin: 7 }}>
				<h2>Font:</h2>
				<Form.Select
					value={settings.fontFamily}
					style={{ width: "20vw", fontFamily: settings.fontFamily }}
					onChange={(e) => setSettings((old) => ({ ...old, fontFamily: e.target.value }))}
				>
					{fonts.map((fontFam) => {
						return (
							<option key={fontFam} style={{ fontFamily: fontFam }} value={fontFam}>
								{fontFam}
							</option>
						);
					})}
				</Form.Select>
			</div>
		</>
	);
}
