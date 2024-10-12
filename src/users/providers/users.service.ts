import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/providers/auth.service';
import { Repository } from 'typeorm';
import profileConfig from '../config/profile.config';
import { CreateManyUsersDto } from '../dtos/create-many-users.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { GetUserParamDto } from '../dtos/get-user-param.dto';
import { User } from '../user.entity';
import { UsersCreateManyProvider } from './users-create-many.provider';

/**
 * Class to connect to Users table and perform business operations
 */
@Injectable()
export class UsersService {
  /**
   * The method to get all the users from the database
   */
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    private readonly configService: ConfigService,

    @Inject(profileConfig.KEY)
    private readonly profileConfiguration: ConfigType<typeof profileConfig>,

    private readonly usersCreateManysProvider: UsersCreateManyProvider,
  ) {}

  public async createUser(createUserDto: CreateUserDto) {
    let existingUser = undefined;

    try {
      existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process  your request at the moment please try late',
        {
          description: 'Error connection to the database',
        },
      );
    }

    if (existingUser) {
      throw new BadRequestException(
        'The user already exists, please check your email',
      );
    }

    let newUser = this.userRepository.create(createUserDto);

    try {
      newUser = await this.userRepository.save(newUser);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process  your request at the moment please try late',
        {
          description: 'Error connection to the database',
        },
      );
    }

    return newUser;
  }

  /**
   * Constructor
   */
  public findAll(
    getUserParamDto: GetUserParamDto,
    limit: number,
    page: number,
  ) {}

  /**
   * Find a single user using the ID of the user
   */
  public async findOneById(id: number) {
    let user = undefined;
    try {
      user = await this.userRepository.findOneBy({ id });
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process  your request at the moment please try late',
        {
          description: 'Error connection to the database',
        },
      );
    }

    if (!user) {
      throw new BadRequestException('The user id does not exist');
    }

    return user;
  }

  public async createMany(createManyUsersDto: CreateManyUsersDto) {
    return await this.usersCreateManysProvider.createMany(createManyUsersDto);
  }
}
