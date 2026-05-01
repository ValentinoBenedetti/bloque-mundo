import { Controller, Post, Get, Body, UseGuards, Request, Param, Delete } from '@nestjs/common';
import { ResenasService } from './resenas.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';

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
  @Get('verificar/:idProducto/:idPedido')
  async check(@Request() req: any, @Param('idProducto') idProducto: string, @Param('idPedido') idPedido: string) {
    const idUsuario = req.user.sub;
    const resena = await this.resenasService.findExistingReview(idUsuario, +idProducto, +idPedido);
    return { 
      hasReviewed: !!resena,
      resena: resena || null
    };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get('admin/:idUsuario/:idProducto/:idPedido')
  async getByAdmin(@Param('idUsuario') idUsuario: string, @Param('idProducto') idProducto: string, @Param('idPedido') idPedido: string) {
    return this.resenasService.findExistingReviewByAdmin(idUsuario, +idProducto, +idPedido);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Delete('admin/:id')
  async deleteByAdmin(@Param('id') id: string) {
    return this.resenasService.deleteByAdmin(+id);
  }
}
