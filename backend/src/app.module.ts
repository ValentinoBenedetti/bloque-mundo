import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TemasModule } from './temas/temas.module';
import { ProductosModule } from './productos/productos.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CarritoModule } from './carrito/carrito.module';
import { LineaCarritoModule } from './linea-carrito/linea-carrito.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { LineaPedidoModule } from './linea-pedido/linea-pedido.module';
import { AuthModule } from './auth/auth.module';
import { FavoritosModule } from './favoritos/favoritos.module';
import { ResenasModule } from './resenas/resenas.module';
import { CombosModule } from './combos/combos.module';
import { CuponesModule } from './cupones/cupones.module';
import { EnviosModule } from './envios/envios.module';
import { CategoriasModule } from './categorias/categorias.module';

@Module({
  imports: [
    // 1. Cargar variables de entorno globalmente
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // 2. Configurar la conexin a PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5433', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      autoLoadEntities: true,
      synchronize: true,
    }),
    TemasModule,
    ProductosModule,
    UsuariosModule,
    CarritoModule,
    LineaCarritoModule,
    PedidosModule,
    LineaPedidoModule,
    AuthModule,
    FavoritosModule,
    ResenasModule,
    CombosModule,
    CuponesModule,
    EnviosModule,
    CategoriasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }