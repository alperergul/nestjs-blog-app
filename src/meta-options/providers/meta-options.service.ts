import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostMetaOptionsDto } from '../dtos/create-post-meta-options.dto';
import { MetaOption } from './../meta-option.entity';

@Injectable()
export class MetaOptionsService {
  constructor(
    @InjectRepository(MetaOption)
    private metaOptionsRepository: Repository<MetaOption>,
  ) {}

  public async create(createPostMetaOption: CreatePostMetaOptionsDto) {
    const metaOption = this.metaOptionsRepository.create(createPostMetaOption);
    return await this.metaOptionsRepository.save(metaOption);
  }
}
