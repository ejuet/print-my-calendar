import React, { CSSProperties, useEffect, useState } from "react";
import { Time } from "ical.js";
import { Container, Form } from "react-bootstrap";
import { Language } from "../lib/date";

export function MyTextInput({ value, onBlur }: { value: string; onBlur: React.FocusEventHandler<HTMLInputElement> }) {
	return <MyInputField value={value} onBlur={onBlur} type="text" min="" max="" style={{ width: "40%" }} />;
}

export function MyNumberInput({
	value,
	onBlur,
	min,
	max,
}: {
	value: string | number;
	onBlur: React.FocusEventHandler<HTMLInputElement>;
	min?: string | number;
	max?: string | number;
}) {
	return <MyInputField value={value} onBlur={onBlur} type="number" min={min} max={max} style={{ width: "20%" }} />;
}

function MyInputField({
	value,
	onBlur,
	min,
	max,
	type,
	style,
}: {
	value: string | number;
	onBlur: React.FocusEventHandler<HTMLInputElement>;
	min?: string | number;
	max?: string | number;
	type: string;
	style?: CSSProperties;
}) {
	const [val, setVal] = useState(value);

	useEffect(() => {
		setVal(value);
	}, [value]);

	return (
		<Form.Control
			as="input"
			min={min}
			max={max}
			type={type}
			style={style}
			value={val}
			onChange={(e) => {
				setVal(e.target.value);
			}}
			onBlur={onBlur}
		/>
	);
}

export function DatePicker({
	onNewDate,
	defaultYear,
	defaultMonth,
	defaultDay,
}: {
	onNewDate: (time: Time) => void;
	defaultYear: number;
	defaultMonth: number;
	defaultDay: number;
}) {
	const [year, setYear] = useState(defaultYear);
	const [day, setDay] = useState(defaultDay);
	const [month, setMonth] = useState(defaultMonth);

	useEffect(() => {
		// Only publish when the local date parts change. The parent passes an inline
		// callback, so depending on `onNewDate` here would retrigger this effect on
		// every parent render and create a render loop.
		onNewDate(new Time({ year, month, day }));
	}, [day, month, year]);

	return (
		<Container>
			<div className="d-flex  justify-content-center" style={{ gap: 10, margin: 15 }}>
				<Form.Control onBlur={(e) => setYear(parseInt(e.target.value))} type="number" defaultValue={year} />
				<Form.Select defaultValue={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
					{Array(12)
						.fill("i")
						.map((_, i) => {
							return (
								<option key={i} value={i + 1}>
									{Language.getMonthNameByNumber(i)}
								</option>
							);
						})}
				</Form.Select>
				<Form.Control onBlur={(e) => setDay(parseInt(e.target.value))} type="number" defaultValue={day} />
			</div>
		</Container>
	);
}
