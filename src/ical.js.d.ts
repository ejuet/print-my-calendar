declare module "ical.js" {
  export function parse(input: string): unknown;

  export class Duration {
    [key: string]: any;
    constructor(data?: Record<string, any>);
    static fromData(data: Record<string, any>): Duration;
    toSeconds(): number;
  }

  export class Timezone {
    [key: string]: any;
    static utcTimezone: Timezone;
    static localTimezone: Timezone;
    static fromData(data: Record<string, any>): Timezone;
    static convert_time(time: Time, fromZone: Timezone, toZone: Timezone): Time;
    toString(): string;
  }

  export class Time {
    [key: string]: any;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    timezone: Timezone;

    constructor(data?: Record<string, any>);
    static fromJSDate(date: Date, useUTC?: boolean): Time;
    static fromData(data: Record<string, any>, zone?: Timezone): Time;
    clone(): Time;
    toJSDate(): Date;
    toString(): string;
    addDuration(duration: Duration): void;
    compare(other: Time): number;
    compareDateOnlyTz(other: Time, zone: Timezone): number;
    convertToZone(zone: Timezone): Time;
  }

  export class Component {
    [key: string]: any;
    constructor(data: unknown);
    getFirstProperty(name: string): { getFirstValue(): string } | null;
    getAllSubcomponents(name: string): unknown[];
  }

  export class Event {
    [key: string]: any;
    startDate: Time;
    duration: Duration;
    summary: string;

    constructor(component: unknown);
    iterator(startDate: Time): { next(): Time | null };
    isRecurring(): boolean;
  }

  export const TimezoneService: any;
}
