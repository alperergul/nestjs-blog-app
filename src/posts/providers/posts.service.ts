import {
  BadRequestException,
  Body,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MetaOption } from 'src/meta-options/meta-option.entity';
import { TagsService } from 'src/tags/providers/tags.service';
import { UsersService } from 'src/users/providers/users.service';
import { Repository } from 'typeorm';
import { CreatePostDto } from '../dtos/creta-post.dto';
import { PatchPostDto } from '../dtos/patch-post.dto';
import { Post } from '../post.entity';

@Injectable()
export class PostsService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(Post)
    private postsReporsitory: Repository<Post>,

    @InjectRepository(MetaOption)
    private metaOptionsRepository: Repository<MetaOption>,

    private readonly tagsService: TagsService,
  ) {}

  public async create(@Body() createPostDto: CreatePostDto) {
    const author = await this.usersService.findOneById(createPostDto.authorId);
    const tags = await this.tagsService.findMultipleTags(createPostDto.tags);

    const post = this.postsReporsitory.create({
      ...createPostDto,
      author,
      tags,
    });

    return await this.postsReporsitory.save(post);
  }

  public async findAll(userId: number) {
    const posts = await this.postsReporsitory.find({
      relations: {
        metaOptions: true,
        // author: true,
        // tags: true,
      },
    });

    return posts;
  }

  public async update(patchPostDto: PatchPostDto) {
    let tags = undefined;
    let post = undefined;

    try {
      tags = await this.tagsService.findMultipleTags(patchPostDto.tags);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
      );
    }

    if (!tags || tags.length !== patchPostDto.tags.length) {
      throw new BadRequestException(
        'Please check ypur tags Ids and ensure they are correct',
      );
    }

    try {
      post = await this.postsReporsitory.findOneBy({ id: patchPostDto.id });
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
      );
    }

    if (!post) {
      throw new BadRequestException('The post ID does not exist');
    }

    post.title = patchPostDto.title ?? post.title;
    post.content = patchPostDto.content ?? post.content;
    post.status = patchPostDto.status ?? post.status;
    post.postType = patchPostDto.postType ?? post.postType;
    post.slug = patchPostDto.slug ?? post.slug;
    post.featuredImageUrl =
      patchPostDto.featuredImageUrl ?? post.featuredImageUrl;
    post.publishOn = patchPostDto.publishOn ?? post.publishOn;

    post.tags = tags;

    try {
      await this.postsReporsitory.save(post);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
      );
    }

    return post;
  }

  public async delete(id: number) {
    await this.postsReporsitory.delete(id);

    return { deleted: true, id };
  }
}
