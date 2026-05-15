import React, { useEffect, useMemo, useState } from "react";
import { Form } from "react-bootstrap";
import { detectAvailableFontFamilies, fontCandidates, genericFontFamilies } from "../lib/fonts";

export function FontFamilySelect({
	value,
	onChange,
	width = "20vw",
}: {
	value: string;
	onChange: (fontFamily: string) => void;
	width?: React.CSSProperties["width"];
}) {
	const [availableFonts, setAvailableFonts] = useState<string[]>(() => [...fontCandidates, ...genericFontFamilies]);

	useEffect(() => {
		const detectedFonts = detectAvailableFontFamilies(fontCandidates);
		setAvailableFonts([...detectedFonts, ...genericFontFamilies]);
	}, []);

	const options = useMemo(() => {
		if(availableFonts.includes(value)) {
			return availableFonts;
		}

		return [value, ...availableFonts];
	}, [availableFonts, value]);

	useEffect(() => {
		if(availableFonts.length === 0 || availableFonts.includes(value)) {
			return;
		}

		onChange(availableFonts[0]);
	}, [availableFonts, onChange, value]);

	return (
		<Form.Select value={value} style={{ width, fontFamily: value }} onChange={(e) => onChange(e.target.value)}>
			{options.map((fontFamily) => {
				const isDetected = availableFonts.includes(fontFamily);
				return (
					<option key={fontFamily} style={{ fontFamily }} value={fontFamily}>
						{fontFamily}
						{isDetected ? "" : " (not detected)"}
					</option>
				);
			})}
		</Form.Select>
	);
}
