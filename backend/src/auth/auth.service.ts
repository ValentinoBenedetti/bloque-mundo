import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario) private usuarioRepository: Repository<Usuario>,
    private jwtService: JwtService,
  ) { }

  // --- FUNCIÓN 1: REGISTRAR UN NUEVO USUARIO ---
  async registrar(datos: any) {
    // 1. Verificamos que el mail no exista
    const existeMail = await this.usuarioRepository.findOne({ where: { email: datos.email } });
    if (existeMail) throw new BadRequestException('Ese correo ya está registrado.');

    // 2. GENERADOR AUTOMÁTICO DE ID (5 dígitos al azar)
    let idGenerado = '';
    let idUnico = false;

    // Este bucle crea IDs hasta encontrar uno que nadie más tenga
    while (!idUnico) {
      // Genera un número entre 10000 y 99999
      idGenerado = Math.floor(10000 + Math.random() * 90000).toString();
      const existeId = await this.usuarioRepository.findOne({ where: { idUsuario: idGenerado } });
      if (!existeId) {
        idUnico = true; // ¡Encontramos uno libre!
      }
    }

    // 3. Encriptamos la contraseña
    const passwordEncriptada = await bcrypt.hash(datos.password, 10);

    // 4. Creamos el usuario con el ID inventado por el sistema
    const nuevoUsuario = this.usuarioRepository.create({
      idUsuario: idGenerado, // <--- Acá usamos el generado automáticamente
      nombre: datos.nombre,
      email: datos.email,
      password: passwordEncriptada,
    });

    await this.usuarioRepository.save(nuevoUsuario);
    return {
      mensaje: '¡Usuario registrado con éxito!',
      idAsignado: idGenerado // Se lo devolvemos para que sepa cuál le tocó
    };
  }

  // --- FUNCIÓN 2: INICIAR SESIÓN ---
  async login(email: string, passwordPlana: string) {
    // 1. Buscamos al usuario por su mail
    const usuario = await this.usuarioRepository.findOne({ where: { email } });
    if (!usuario) throw new UnauthorizedException('Credenciales incorrectas');

    // 2. Comparamos la contraseña plana con la encriptada de la base de datos
    const passwordValida = await bcrypt.compare(passwordPlana, usuario.password);
    if (!passwordValida) throw new UnauthorizedException('Credenciales incorrectas');

    // 3. Si todo está bien, fabricamos el Pase VIP (JWT)
    const payload = { sub: usuario.idUsuario, nombre: usuario.nombre, rol: 'Usuario', esAdmin: usuario.esAdmin };

    return {
      access_token: await this.jwtService.signAsync(payload),
      usuario: { id: usuario.idUsuario, nombre: usuario.nombre }
    };
  }
}