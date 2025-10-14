import { validate } from 'class-validator';
import { CreateBookingDto } from './create-booking.dto';
import { CancelBookingDto } from './cancel-booking.dto';
import { ConfirmBookingDto } from './confirm-booking.dto';

describe('DTO Validation Edge Cases', () => {
    describe('CreateBookingDto', () => {
        it('should validate with valid data', async () => {
            const dto = new CreateBookingDto();
            dto.userId = '123e4567-e89b-12d3-a456-426614174000';
            dto.resourceId = '123e4567-e89b-12d3-a456-426614174001';
            dto.startTime = '2024-01-15T10:00:00.000Z';
            dto.endTime = '2024-01-15T12:00:00.000Z';
            dto.notes = 'Test booking';

            const errors = await validate(dto);

            expect(errors).toHaveLength(0);
        });

        it('should fail validation with empty userId', async () => {
            const dto = new CreateBookingDto();
            dto.userId = '';
            dto.resourceId = '123e4567-e89b-12d3-a456-426614174001';
            dto.startTime = '2024-01-15T10:00:00.000Z';
            dto.endTime = '2024-01-15T12:00:00.000Z';

            const errors = await validate(dto);

            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('userId');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation with invalid UUID format for userId', async () => {
            const dto = new CreateBookingDto();
            dto.userId = 'invalid-uuid';
            dto.resourceId = '123e4567-e89b-12d3-a456-426614174001';
            dto.startTime = '2024-01-15T10:00:00.000Z';
            dto.endTime = '2024-01-15T12:00:00.000Z';

            const errors = await validate(dto);

            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('userId');
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail validation with invalid UUID format for resourceId', async () => {
            const dto = new CreateBookingDto();
            dto.userId = '123e4567-e89b-12d3-a456-426614174000';
            dto.resourceId = 'invalid-uuid';
            dto.startTime = '2024-01-15T10:00:00.000Z';
            dto.endTime = '2024-01-15T12:00:00.000Z';

            const errors = await validate(dto);

            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('resourceId');
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail validation with invalid date format for startTime', async () => {
            const dto = new CreateBookingDto();
            dto.userId = '123e4567-e89b-12d3-a456-426614174000';
            dto.resourceId = '123e4567-e89b-12d3-a456-426614174001';
            dto.startTime = 'invalid-date';
            dto.endTime = '2024-01-15T12:00:00.000Z';

            const errors = await validate(dto);

            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('startTime');
            expect(errors[0].constraints).toHaveProperty('isDateString');
        });

        it('should fail validation with invalid date format for endTime', async () => {
            const dto = new CreateBookingDto();
            dto.userId = '123e4567-e89b-12d3-a456-426614174000';
            dto.resourceId = '123e4567-e89b-12d3-a456-426614174001';
            dto.startTime = '2024-01-15T10:00:00.000Z';
            dto.endTime = 'invalid-date';

            const errors = await validate(dto);

            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('endTime');
            expect(errors[0].constraints).toHaveProperty('isDateString');
        });

        it('should fail validation with notes exceeding max length', async () => {
            const dto = new CreateBookingDto();
            dto.userId = '123e4567-e89b-12d3-a456-426614174000';
            dto.resourceId = '123e4567-e89b-12d3-a456-426614174001';
            dto.startTime = '2024-01-15T10:00:00.000Z';
            dto.endTime = '2024-01-15T12:00:00.000Z';
            dto.notes = 'A'.repeat(501); // Exceeds max length of 500

            const errors = await validate(dto);

            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('notes');
            expect(errors[0].constraints).toHaveProperty('maxLength');
        });

        it('should validate with notes at max length', async () => {
            const dto = new CreateBookingDto();
            dto.userId = '123e4567-e89b-12d3-a456-426614174000';
            dto.resourceId = '123e4567-e89b-12d3-a456-426614174001';
            dto.startTime = '2024-01-15T10:00:00.000Z';
            dto.endTime = '2024-01-15T12:00:00.000Z';
            dto.notes = 'A'.repeat(500); // Exactly max length

            const errors = await validate(dto);

            expect(errors).toHaveLength(0);
        });

        it('should validate without notes (optional field)', async () => {
            const dto = new CreateBookingDto();
            dto.userId = '123e4567-e89b-12d3-a456-426614174000';
            dto.resourceId = '123e4567-e89b-12d3-a456-426614174001';
            dto.startTime = '2024-01-15T10:00:00.000Z';
            dto.endTime = '2024-01-15T12:00:00.000Z';
            // notes is undefined

            const errors = await validate(dto);

            expect(errors).toHaveLength(0);
        });

        it('should validate with empty notes', async () => {
            const dto = new CreateBookingDto();
            dto.userId = '123e4567-e89b-12d3-a456-426614174000';
            dto.resourceId = '123e4567-e89b-12d3-a456-426614174001';
            dto.startTime = '2024-01-15T10:00:00.000Z';
            dto.endTime = '2024-01-15T12:00:00.000Z';
            dto.notes = '';

            const errors = await validate(dto);

            expect(errors).toHaveLength(0);
        });

        it('should fail validation with null userId', async () => {
            const dto = new CreateBookingDto();
            dto.userId = null as any;
            dto.resourceId = '123e4567-e89b-12d3-a456-426614174001';
            dto.startTime = '2024-01-15T10:00:00.000Z';
            dto.endTime = '2024-01-15T12:00:00.000Z';

            const errors = await validate(dto);

            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('userId');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation with undefined userId', async () => {
            const dto = new CreateBookingDto();
            dto.userId = undefined as any;
            dto.resourceId = '123e4567-e89b-12d3-a456-426614174001';
            dto.startTime = '2024-01-15T10:00:00.000Z';
            dto.endTime = '2024-01-15T12:00:00.000Z';

            const errors = await validate(dto);

            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('userId');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should validate with different UUID formats', async () => {
            const validUuids = [
                '123e4567-e89b-12d3-a456-426614174000',
                '550e8400-e29b-41d4-a716-446655440000',
                '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
                '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
            ];

            for (const uuid of validUuids) {
                const dto = new CreateBookingDto();
                dto.userId = uuid;
                dto.resourceId = uuid;
                dto.startTime = '2024-01-15T10:00:00.000Z';
                dto.endTime = '2024-01-15T12:00:00.000Z';

                const errors = await validate(dto);

                expect(errors).toHaveLength(0);
            }
        });

        it('should validate with different date formats', async () => {
            const validDates = [
                '2024-01-15T10:00:00.000Z',
                '2024-01-15T10:00:00Z',
                '2024-01-15T10:00:00.123Z',
                '2024-12-31T23:59:59.999Z',
            ];

            for (const date of validDates) {
                const dto = new CreateBookingDto();
                dto.userId = '123e4567-e89b-12d3-a456-426614174000';
                dto.resourceId = '123e4567-e89b-12d3-a456-426614174001';
                dto.startTime = date;
                dto.endTime = date;

                const errors = await validate(dto);

                expect(errors).toHaveLength(0);
            }
        });
    });

    describe('CancelBookingDto', () => {
        it('should validate with valid reason', async () => {
            const dto = new CancelBookingDto();
            dto.reason = 'Change of plans';

            const errors = await validate(dto);

            expect(errors).toHaveLength(0);
        });

        it('should validate without reason (optional field)', async () => {
            const dto = new CancelBookingDto();
            // reason is undefined

            const errors = await validate(dto);

            expect(errors).toHaveLength(0);
        });

        it('should validate with empty reason', async () => {
            const dto = new CancelBookingDto();
            dto.reason = '';

            const errors = await validate(dto);

            expect(errors).toHaveLength(0);
        });

        it('should validate with reason at max length', async () => {
            const dto = new CancelBookingDto();
            dto.reason = 'A'.repeat(500); // Exactly max length

            const errors = await validate(dto);

            expect(errors).toHaveLength(0);
        });

        it('should fail validation with reason exceeding max length', async () => {
            const dto = new CancelBookingDto();
            dto.reason = 'A'.repeat(501); // Exceeds max length of 500

            const errors = await validate(dto);

            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('reason');
            expect(errors[0].constraints).toHaveProperty('maxLength');
        });

        it('should fail validation with non-string reason', async () => {
            const dto = new CancelBookingDto();
            dto.reason = 123 as any;

            const errors = await validate(dto);

            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('reason');
            expect(errors[0].constraints).toHaveProperty('isString');
        });

        it('should validate with special characters in reason', async () => {
            const dto = new CancelBookingDto();
            dto.reason = 'Reason with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';

            const errors = await validate(dto);

            expect(errors).toHaveLength(0);
        });

        it('should validate with unicode characters in reason', async () => {
            const dto = new CancelBookingDto();
            dto.reason = 'Reason with unicode: 预订取消 🎫';

            const errors = await validate(dto);

            expect(errors).toHaveLength(0);
        });

        it('should validate with newlines in reason', async () => {
            const dto = new CancelBookingDto();
            dto.reason = 'Line 1\nLine 2\nLine 3';

            const errors = await validate(dto);

            expect(errors).toHaveLength(0);
        });
    });

    describe('ConfirmBookingDto', () => {
        it('should be an empty DTO class', () => {
            const dto = new ConfirmBookingDto();

            // ConfirmBookingDto is intentionally empty as confirmation only requires the booking ID from the URL parameter
            expect(dto).toBeDefined();
            expect(dto).toBeInstanceOf(ConfirmBookingDto);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle malformed DTO objects', async () => {
            const malformedDto = {
                userId: null,
                resourceId: undefined,
                startTime: '',
                endTime: null,
                notes: 123,
            } as any;

            const errors = await validate(malformedDto);

            expect(errors.length).toBeGreaterThan(0);
        });

        it('should handle DTOs with extra properties', async () => {
            const dto = new CreateBookingDto();
            dto.userId = '123e4567-e89b-12d3-a456-426614174000';
            dto.resourceId = '123e4567-e89b-12d3-a456-426614174001';
            dto.startTime = '2024-01-15T10:00:00.000Z';
            dto.endTime = '2024-01-15T12:00:00.000Z';
            (dto as any).extraProperty = 'extra value';

            const errors = await validate(dto);

            expect(errors).toHaveLength(0); // Extra properties don't cause validation errors
        });

        it('should handle concurrent validation', async () => {
            const dtos = Array.from({ length: 10 }, (_, i) => {
                const dto = new CreateBookingDto();
                dto.userId = '123e4567-e89b-12d3-a456-426614174000';
                dto.resourceId = '123e4567-e89b-12d3-a456-426614174001';
                dto.startTime = '2024-01-15T10:00:00.000Z';
                dto.endTime = '2024-01-15T12:00:00.000Z';
                dto.notes = `Test booking ${i}`;
                return dto;
            });

            const validationPromises = dtos.map(dto => validate(dto));
            const results = await Promise.all(validationPromises);

            results.forEach(errors => {
                expect(errors).toHaveLength(0);
            });
        });
    });
});
