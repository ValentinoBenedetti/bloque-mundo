import { Controller, Get, Post, Body } from '@nestjs/common';
import { TemasService } from './temas.service';

@Controller('temas')
export class TemasController {
  constructor(private readonly temasService: TemasService) { }

  @Post()
  create(@Body() createTemaDto: any) {
    return this.temasService.create(createTemaDto);
  }

  @Get()
  findAll() {
    return this.temasService.findAll();
  }
}