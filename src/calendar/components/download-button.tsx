import React, { useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { CalendarRenderer, RendererPreviewProps } from "../renderers/types";

export function DownloadButton({ renderer, rendererProps }: { renderer: CalendarRenderer; rendererProps: RendererPreviewProps }) {
	const [downloading, setDownloading] = useState(false);

	return (
		<>
			<Button
				onClick={() => {
					setDownloading(true);
					renderer.savePdf(rendererProps).finally(() => {
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
