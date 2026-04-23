import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { FavoritosService } from './favoritos.service';

@Controller('favoritos')
export class FavoritosController {
  constructor(private readonly favoritosService: FavoritosService) { }

  // GET: http://localhost:3000/favoritos/1 (Trae los del usuario ID 1)
  @Get(':usuarioId')
  findAll(@Param('usuarioId') usuarioId: string) {
    return this.favoritosService.findAllByUser(usuarioId);
  }

  // POST: http://localhost:3000/favoritos/toggle
  // Body: { "usuarioId": "U0001", "productoId": 15 }
  @Post('toggle')
  toggle(@Body() body: { usuarioId: string; productoId: number }) {
    return this.favoritosService.toggleFavorite(body.usuarioId, body.productoId);
  }
}