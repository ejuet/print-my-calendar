const baseFontFamilies = ["monospace", "sans-serif", "serif"] as const;
const sampleText = "abcdefghijklmnopqrstuvwxyz0123456789";
const sampleFontSize = "72px";

export const fontCandidates = [
	"PleaseWriteMeASong",
	"American Typewriter",
	"Apple Color Emoji",
	"Arial",
	"Arial Black",
	"Avenir",
	"Avenir Next",
	"Bahnschrift",
	"Baskerville",
	"Calibri",
	"Cambria",
	"Cambria Math",
	"Candara",
	"Cantarell",
	"Chalkboard",
	"Chalkboard SE",
	"Comic Sans MS",
	"Consolas",
	"Constantia",
	"Copperplate",
	"Corbel",
	"Courier New",
	"DejaVu Sans",
	"DejaVu Sans Mono",
	"DejaVu Serif",
	"Didot",
	"Droid Sans",
	"Droid Serif",
	"Ebrima",
	"FreeMono",
	"FreeSans",
	"FreeSerif",
	"Franklin Gothic Medium",
	"Futura",
	"Gabriola",
	"Gadugi",
	"Geneva",
	"Gill Sans",
	"Georgia",
	"Garamond",
	"Helvetica",
	"Helvetica Neue",
	"Hoefler Text",
	"HoloLens MDL2 Assets",
	"Impact",
	"Ink Free",
	"Javanese Text",
	"Leelawadee UI",
	"Liberation Mono",
	"Liberation Sans",
	"Liberation Serif",
	"Lucida Console",
	"Lucida Grande",
	"Lucida Sans Unicode",
	"Malgun Gothic",
	"Marlett",
	"Marker Felt",
	"Menlo",
	"Microsoft Himalaya",
	"Microsoft JhengHei",
	"Microsoft New Tai Lue",
	"Microsoft PhagsPa",
	"Microsoft Sans Serif",
	"Microsoft Tai Le",
	"Microsoft YaHei",
	"Microsoft Yi Baiti",
	"MingLiU-ExtB",
	"Monaco",
	"Mongolian Baiti",
	"MS Gothic",
	"MV Boli",
	"Myanmar Text",
	"Nirmala UI",
	"Noto Color Emoji",
	"Noto Sans",
	"Noto Sans Mono",
	"Noto Serif",
	"Optima",
	"Palatino Linotype",
	"Palatino",
	"Segoe UI Variable",
	"Segoe MDL2 Assets",
	"Segoe Print",
	"Segoe Script",
	"Segoe UI",
	"Segoe UI Historic",
	"Segoe UI Emoji",
	"Segoe UI Symbol",
	"SimSun",
	"Sitka",
	"Symbol",
	"Sylfaen",
	"Tahoma",
	"Times New Roman",
	"Times",
	"Trebuchet MS",
	"Ubuntu",
	"Ubuntu Mono",
	"Verdana",
	"Webdings",
	"Wingdings",
	"Yu Gothic",
] as const;

export const genericFontFamilies = [...baseFontFamilies, "system-ui", "ui-sans-serif", "ui-serif", "ui-monospace", "cursive", "fantasy"];

type TextMetricsSnapshot = {
	width: number;
	ascent: number;
	descent: number;
};

export function detectAvailableFontFamilies(candidates: readonly string[]) {
	if(typeof document === "undefined") {
		return [...candidates];
	}

	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	if(!context) {
		return [...candidates];
	}

	const baseMeasurements = new Map<string, TextMetricsSnapshot>();

	for(const baseFontFamily of baseFontFamilies) {
		context.font = `${sampleFontSize} ${baseFontFamily}`;
		baseMeasurements.set(baseFontFamily, measureText(context));
	}

	return candidates.filter((candidate) => {
		return baseFontFamilies.some((baseFontFamily) => {
			context.font = `${sampleFontSize} "${candidate}", ${baseFontFamily}`;
			return !matchesSnapshot(measureText(context), baseMeasurements.get(baseFontFamily)!);
		});
	});
}

function measureText(context: CanvasRenderingContext2D): TextMetricsSnapshot {
	const metrics = context.measureText(sampleText);
	return {
		width: metrics.width,
		ascent: metrics.actualBoundingBoxAscent,
		descent: metrics.actualBoundingBoxDescent,
	};
}

function matchesSnapshot(left: TextMetricsSnapshot, right: TextMetricsSnapshot) {
	return left.width === right.width && left.ascent === right.ascent && left.descent === right.descent;
}
