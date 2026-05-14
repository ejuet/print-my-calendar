import React, { useState } from "react";
import { Time } from "ical.js";
import { Button, Spinner } from "react-bootstrap";
import { downloadAsPDF } from "../lib/export";

export function DownloadButton({ startOfCalendar, endOfCalendar }: { startOfCalendar: Time; endOfCalendar: Time }) {
	const [downloading, setDownloading] = useState(false);

	return (
		<>
			<Button
				onClick={() => {
					setDownloading(true);
					downloadAsPDF(startOfCalendar, endOfCalendar).finally(() => {
						setDownloading(false);
					});
				}}
			>
				Save as PDF
			</Button>
			{downloading && (
				<div style={{ marginTop: 5 }}>
					<Spinner />
					<p>Creating PDF...</p>
				</div>
			)}
		</>
	);
}
