import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.temasService.remove(+id);
  }
}