import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'confirmPassword', async: false })
export class PasswordMatchValidator implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const password = args.object['password'];
        return password === value;
    }

    defaultMessage(args: ValidationArguments) {
        return 'confirm password must match the password';
    }
}
