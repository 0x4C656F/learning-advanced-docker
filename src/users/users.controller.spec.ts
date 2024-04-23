import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

describe('UsersController', () => {
  let controller: UsersController;
  const user: User = {
    name: 'John Doe',
    email: 'email@email.com',
    password: 'hashedPassword',
    id: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService, PrismaService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should create a user', async () => {
    const mockCreateUserDto = {
      name: user.name,
      email: user.email,
      password: 'password',
    };

    jest.spyOn(controller['usersService'], 'create').mockResolvedValue(user);

    const res = await controller.create(mockCreateUserDto);
    expect(res).toEqual(user);
  });

  it('should find all users', async () => {
    const users: User[] = [user];
    jest.spyOn(controller['usersService'], 'findAll').mockResolvedValue(users);

    const res = await controller.findAll();
    expect(res).toEqual(users);
  });

  it('should find one user', async () => {
    jest.spyOn(controller['usersService'], 'findOne').mockResolvedValue(user);

    const res = await controller.findOne(user.id);
    expect(res).toEqual(user);
  });

  it('should update a user', async () => {
    const updatedUser = { ...user, name: 'Jane Doe' };
    jest
      .spyOn(controller['usersService'], 'update')
      .mockResolvedValue(updatedUser);

    const res = await controller.update(user.id, { name: 'Jane Doe' });
    expect(res).toEqual(updatedUser);
  });

  it('should delete a user', async () => {
    jest.spyOn(controller['usersService'], 'remove').mockResolvedValue(user);

    const res = await controller.remove(user.id);
    expect(res).toBe(user);
  });
});
