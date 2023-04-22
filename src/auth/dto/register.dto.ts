import { ApiProperty } from "@nestjs/swagger";
import { IsPhoneNumber, IsString, Matches, Validate, ValidateIf } from "class-validator";
import { PasswordMatchValidator } from "../../validators/password-match.validator";

export class RegisterDto {
    @IsString({message: 'accountName not found'})
    @Matches(/^\w+$/u, {message: 'accountName is not valid'})
    @ApiProperty({
        type: String,
        example: 'tentaikhoan',
    })
    accountName: string;

    @IsString({message: 'username not found'})
    @ApiProperty({
        type: String,
        example: 'Nguyễn Văn A',
    })
    username: string;

    @IsPhoneNumber('VN', {message: 'phone not found'})
    @ApiProperty({
        type: String,
        example: '0343892050',
        description: 'Số điện thoại phải đúng 10 số! theo số điện thoại Việt Nam!',
    })
    phone: string;

    @IsString({message: 'password not found'})
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
        message: 'password too weak',
    })
    @ApiProperty({
        type: String,
        example: '123Beta456@',
        description:
            'Mật khẩu phải ít nhất 8 ký tự, trong đó phải có chữ và số',
    })
    password: string;

    @ValidateIf((o) =>o.password != undefined)
    @Validate(PasswordMatchValidator)
    @ApiProperty({
        type: String,
        example: '123Beta456@',
    })
    confirmPassword: string;
}
