import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class PasswordPipe implements PipeTransform {
  transform(value: any) {
    // 문자열로 변환
    const password = value.toString();

    // 숫자, 문자, 특수 문자가 각각 포함되어 있는지 확인하는 정규식
    const hasNumber = /[0-9]/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // 조건을 만족하지 않으면 예외 발생
    if (!hasNumber || !hasLetter || !hasSpecialChar) {
      throw new BadRequestException(
        '비밀번호는 문자, 숫자, 특수문자를 포함해야 합니다.',
      );
    }

    if (password.length < 8) {
      throw new BadRequestException('비밀번호는 8자 이상이어야 합니다.');
    }

    return password;
  }
}
