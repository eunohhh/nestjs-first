import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  ENV_JWT_HASH_ROUNDS,
  ENV_JWT_SECRET_KEY,
} from 'src/common/const/env-keys.const';
import { UsersModel } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}
  /**
   * 우리가 만들어야 하는 기능
   *
   * 1) registerWithEmail
   *    - email, nickname, password 를 입력받고 사용자를 생성한다
   *    - 생성이 완료되면 accessToken 과 refreshToken을 반환한다 < 회원가입 후 다시 로그인해주세요 <- 를 방지하기 위해서
   *
   * 2) loginWithEamil
   *    - email, password 를 입력하면 사용자 검증을 진행한다
   *    - 검증이 완료되면 accessToken 과 refreshToken을 반환한다
   *
   * 3) loginUser
   *    - (1)과 (2)에 필요한 accessToken과 refreshToken 을 반환하는 로직
   *
   * 4) signToken
   *    - (3)에서 필요한 accessToken과 refreshToken 을 sign 하는 로직
   *
   * 5) authenticateWithEmailAndPassword
   *    - (2)에서 로그인을 진행할 때 필요한 기본적인 검증 진행
   *      1. 사용자가 존재하는지 확인
   *      2. 비밀번호가 맞는지 확인
   *      3. 모두 통과되면 사용자 정보 반환
   *      4. loginWithEmail 에서 반환된 데이터를 기반으로 토큰 생성
   */

  /**
   * payload 에 들어갈 정보
   *
   * 1) email
   * 2) sub -> id
   * 3) type: 'access' | 'refresh'
   */
  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get(ENV_JWT_SECRET_KEY),
      // sec
      expiresIn: isRefreshToken ? 3600 : 300,
    });
  }

  async loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accssToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  async authenticateWithEmailAndPassword(
    user: Pick<UsersModel, 'email' | 'password'>,
  ) {
    const existingUser = await this.usersService.getUserByEmail(user.email);

    if (!existingUser)
      throw new UnauthorizedException('존재하지 않는 사용자 입니다');

    /**
     * 파라미터
     * 1) 입력된 비밀번호
     * 2) 기존 해시 -> 사용자 정보에 저장되어 있는 hash
     */
    const passOk = await bcrypt.compare(user.password, existingUser.password);

    if (!passOk) throw new UnauthorizedException('비밀번호가 틀렸습니다.');

    return existingUser;
  }

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.authenticateWithEmailAndPassword(user);

    return this.loginUser(existingUser);
  }

  async registerWithEmail(
    user: Pick<UsersModel, 'nickname' | 'email' | 'password'>,
  ) {
    const hash = await bcrypt.hash(
      user.password,
      Number(this.configService.get(ENV_JWT_HASH_ROUNDS)),
    );
    const newUser = await this.usersService.createUser({
      ...user,
      password: hash,
    });

    return this.loginUser(newUser);
  }
}
