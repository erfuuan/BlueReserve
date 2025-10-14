import { v4 as uuidv4 } from 'uuid';

export class BookingId {
    public readonly value: string;

    constructor(value?: string) {
        this.value = value || uuidv4();
    }

    toString(): string {
        return this.value;
    }

    equals(other: BookingId): boolean {
        return this.value === other.value;
    }

    static fromString(value: string): BookingId {
        return new BookingId(value);
    }
}
