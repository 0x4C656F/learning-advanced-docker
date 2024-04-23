import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { ConflictException } from '@nestjs/common';
const prismaMock = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};
describe('UsersService', () => {
  let service: UsersService;

  const mockUser: Partial<User> = {
    id: '1',
    name: 'John Doe',
    email: 'email@email.com',
    password: 'hashedPassword',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    prismaMock.user.findUnique.mockClear();
    prismaMock.user.findMany.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const mockCreateUserDto: CreateUserDto = {
      name: mockUser.name,
      email: mockUser.email,
      password: 'password',
    };
    it('should create a user', async () => {
      jest.spyOn(prismaMock.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaMock.user, 'create').mockResolvedValue(mockUser as User);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

      const res = await service.create(mockCreateUserDto);

      expect(res).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          name: mockCreateUserDto.name,
          email: mockCreateUserDto.email,
          password: 'hashedPassword',
        },
      });
    });
    it('should throw a ConflictException if the user already exists', async () => {
      jest
        .spyOn(prismaMock.user, 'findUnique')
        .mockResolvedValue(mockUser as User);

      await expect(service.create(mockCreateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      jest.spyOn(prismaMock.user, 'findMany').mockResolvedValue([mockUser]);

      const res = await service.findAll();

      expect(res).toEqual([mockUser]);
      expect(prismaMock.user.findMany).toHaveBeenCalled();
    });
  });
  describe('findOne', () => {
    it('should return a user', async () => {
      jest
        .spyOn(prismaMock.user, 'findUnique')
        .mockResolvedValue(mockUser as User);

      const res = await service.findOne('1');

      expect(res).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
  describe('update', () => {
    it('should update a user', async () => {
      jest.spyOn(prismaMock.user, 'update').mockResolvedValue(mockUser as User);

      const res = await service.update('1', { name: 'Jane Doe' });

      expect(res).toEqual(mockUser);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Jane Doe' },
      });
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      jest
        .spyOn(prismaMock.user, 'delete')
        .mockImplementation()
        .mockResolvedValue(mockUser);

      const res = await service.remove('1');

      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prismaMock.user.delete).toHaveBeenCalledTimes(1);
      expect(res).toEqual(mockUser);
    });
  });
});
