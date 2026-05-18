import { Injectable, UnauthorizedException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service'; // 🔥 Importante

@Injectable()
export class AuthService {
  constructor(
    // 🔥 Inyectamos UsuariosService usando forwardRef para evitar problemas de dependencias circulares
    @Inject(forwardRef(() => UsuariosService))
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) { }

  // --- 1. VERIFICAR SI EL EMAIL EXISTE (Para el Modal de Google) ---
  async verificarExistencia(email: string) {
    const usuario = await this.usuariosService.buscarPorEmail(email);

    if (usuario) {
      const payload = {
        sub: usuario.idUsuario,
        nombre: usuario.nombre,
        email: usuario.email,
        esAdmin: usuario.esAdmin // 🔥 Agregado para que no se pierda al iniciar sesión con Google
      };

      return {
        exists: true,
        token: await this.jwtService.signAsync(payload)
      };
    }

    return { exists: false };
  }

  // --- 2. REGISTRAR CON GOOGLE (El que pide tu AuthController) ---
  async registrarConGoogle(datos: any) {
    // Usamos el método de UsuariosService que ya genera el ID de 5 dígitos
    const nuevoUsuario = await this.usuariosService.crearUsuario(datos);

    const payload = {
      sub: nuevoUsuario.idUsuario,
      nombre: nuevoUsuario.nombre,
      email: nuevoUsuario.email,
      esAdmin: nuevoUsuario.esAdmin // 🔥 Agregado para que no se pierda al registrarse con Google
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: nuevoUsuario
    };
  }

  // --- 3. LOGIN TRADICIONAL (Email y Password) ---
  async login(email: string, passwordPlana: string) {
    const usuario = await this.usuariosService.buscarPorEmail(email);
    if (!usuario) throw new UnauthorizedException('Credenciales incorrectas');

    // Si el usuario se registró con Google, no tendrá password
    if (!usuario.password) {
      throw new UnauthorizedException('Este correo utiliza inicio de sesión con Google');
    }

    const passwordValida = await bcrypt.compare(passwordPlana, usuario.password);
    if (!passwordValida) throw new UnauthorizedException('Credenciales incorrectas');

    const payload = {
      sub: usuario.idUsuario,
      nombre: usuario.nombre,
      email: usuario.email,
      esAdmin: usuario.esAdmin
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      usuario: { id: usuario.idUsuario, nombre: usuario.nombre }
    };
  }

  // --- 4. REGISTRO TRADICIONAL (Opcional, por si lo sigues usando) ---
  async registrar(datos: any) {
    const existeMail = await this.usuariosService.buscarPorEmail(datos.email);
    if (existeMail) throw new BadRequestException('Ese correo ya está registrado.');

    // Encriptamos antes de mandar a UsuariosService
    const passwordEncriptada = await bcrypt.hash(datos.password, 10);

    const nuevoUsuario = await this.usuariosService.crearUsuario({
      ...datos,
      password: passwordEncriptada
    });

    return {
      mensaje: '¡Usuario registrado con éxito!',
      idAsignado: nuevoUsuario.idUsuario
    };
  }
}