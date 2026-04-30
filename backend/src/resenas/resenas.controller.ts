import { Controller, Post, Get, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ResenasService } from './resenas.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('resenas')
export class ResenasController {
  constructor(private readonly resenasService: ResenasService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Request() req: any, @Body() createResenaDto: any) {
    const idUsuario = req.user.sub;
    return this.resenasService.create(idUsuario, createResenaDto);
  }

  @Get('producto/:id')
  async findByProducto(@Param('id') id: string) {
    return this.resenasService.findByProducto(+id);
  }

  @UseGuards(AuthGuard)
  @Get('verificar/:idProducto')
  async check(@Request() req: any, @Param('idProducto') idProducto: string) {
    const idUsuario = req.user.sub;
    const resena = await this.resenasService.findExistingReview(idUsuario, +idProducto);
    return { 
      hasReviewed: !!resena,
      resena: resena || null
    };
  }
}
