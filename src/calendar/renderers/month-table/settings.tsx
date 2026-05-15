import React from "react";
import { Form } from "react-bootstrap";
import { MyNumberInput } from "../../components/inputs";
import { fonts } from "../../lib/constants";
import { RendererSettingsProps } from "../types";

export type MonthTableRendererSettings = {
	previewAmount: number;
	fontFamily: string;
	lineHeight: number;
	calendarWidth: number;
	fontSize: number;
	fontSizeHeading: number;
};

export const defaultMonthTableRendererSettings: MonthTableRendererSettings = {
	previewAmount: 31,
	fontFamily: "Calibri",
	lineHeight: 400,
	calendarWidth: 130,
	fontSize: 200,
	fontSizeHeading: 140,
};

export function MonthTableSettings({ settings, setSettings }: RendererSettingsProps<MonthTableRendererSettings>) {
	return (
		<>
			<h3>Display Settings</h3>

			<div className="d-flex justify-content-center" style={{ gap: 10, margin: 7 }}>
				<h2>Font Size (%):</h2>
				<MyNumberInput value={settings.fontSize} onBlur={(e) => setSettings((old) => ({ ...old, fontSize: Number(e.target.value) }))} min="0" max="" />
			</div>

			<div className="d-flex justify-content-center" style={{ gap: 10, margin: 7 }}>
				<h2>Font Size Heading (%):</h2>
				<MyNumberInput
					value={settings.fontSizeHeading}
					onBlur={(e) => setSettings((old) => ({ ...old, fontSizeHeading: Number(e.target.value) }))}
					min="0"
					max=""
				/>
			</div>

			<div className="d-flex justify-content-center" style={{ gap: 10, margin: 7 }}>
				<h2>Width (%):</h2>
				<MyNumberInput value={settings.calendarWidth} onBlur={(e) => setSettings((old) => ({ ...old, calendarWidth: Number(e.target.value) }))} min="1" max="" />
			</div>

			<div style={{ gap: 10, margin: 7, display: "none" }}>
				<h2>Amount of days to preview:</h2>
				<MyNumberInput value={settings.previewAmount} onBlur={(e) => setSettings((old) => ({ ...old, previewAmount: Number(e.target.value) }))} min="0" max="" />
			</div>

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
