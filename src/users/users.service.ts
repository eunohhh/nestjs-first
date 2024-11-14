import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersModel } from './entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
  ) {}

  async getAllUsers() {
    return this.usersRepository.find();
  }

  async createUser(user: Pick<UsersModel, 'nickname' | 'email' | 'password'>) {
    // 닉네임 중복이 없는지 확인
    // exist
    const nicknameExists = await this.usersRepository.exists({
      where: {
        nickname: user.nickname,
      },
    });

    if (nicknameExists)
      throw new BadRequestException('이미 존재하는 nickname 입니다');

    const emailExist = await this.usersRepository.exists({
      where: {
        email: user.email,
      },
    });

    if (emailExist) throw new BadRequestException('이미 가입한 이메일 입니다.');

    const userObject = await this.usersRepository.create({
      nickname: user.nickname,
      email: user.email,
      password: user.password,
    });

    const newUser = await this.usersRepository.save(userObject);

    return newUser;
  }

  async getUserByEmail(email: string) {
    return this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }
}
