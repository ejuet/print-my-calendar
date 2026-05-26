import html2canvas from "html2canvas";
import { Time } from "ical.js";
import { PDFDocument, PageSizes } from "pdf-lib";
import { getDaysInMonths, mapMonthMap } from "./date";

export async function createPdf(urls: string[], filename: string) {
	const pdfDoc = await PDFDocument.create();

	for(const url of urls) {
		const imageBytes = await fetch(url).then((response) => response.arrayBuffer());
		const image = await pdfDoc.embedJpg(imageBytes);
		const page = pdfDoc.addPage(PageSizes.A4);
		const { width, height } = page.getSize();
		const fac = 0.95;
		const imageSize = { width: width * fac, height: height * fac };
		const x = (width - imageSize.width) / 2;
		const y = (height - imageSize.height) / 2;

		page.drawImage(image, {
			x,
			y,
			width: imageSize.width,
			height: imageSize.height,
		});
	}

	const pdfBytes = await pdfDoc.save();
	const pdfBuffer = new Uint8Array(pdfBytes).buffer as ArrayBuffer;
	const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
	const downloadLink = document.createElement("a");
	downloadLink.href = URL.createObjectURL(pdfBlob);
	downloadLink.download = `${filename}.pdf`;
	downloadLink.click();
}

export function downloadAsPDF(startOfCalendar: Time, endOfCalendar: Time, extraPageIds: string[] = []) {
	const promises: Promise<HTMLAnchorElement>[] = [];
	mapMonthMap(getDaysInMonths(startOfCalendar, endOfCalendar), (monthAndYear) => {
		promises.push(getDownloadLink(monthAndYear));
		return null;
	});
	extraPageIds.forEach((pageId) => {
		promises.push(getDownloadLink(pageId));
	});

	return Promise.all(promises).then((links) => {
		const urls = links.map((link) => link.href);
		return createPdf(urls, `Calendar-${startOfCalendar}-${endOfCalendar}`);
	});
}

export function getDownloadLink(monthAndYear: string): Promise<HTMLAnchorElement> {
	return new Promise((resolve, reject) => {
		const element = document.getElementById(monthAndYear);
		if(!element) {
			reject(new Error(`Element with id "${monthAndYear}" not found`));
			return;
		}

		html2canvas(element, { scrollX: -window.scrollX, scale: 6 })
			.then((canvas) => {
				const link = document.createElement("a");
				link.download = `${monthAndYear}.jpg`;
				link.href = canvas.toDataURL("image/jpeg", 0.9);
				resolve(link);
			})
			.catch(reject);
	});
}
