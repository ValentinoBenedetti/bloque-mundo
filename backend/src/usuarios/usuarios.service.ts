import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) { }

  // 🔥 NUEVO: Función para buscar por email (LA NECESITA EL AUTH SERVICE)
  async buscarPorEmail(email: string) {
    return await this.usuarioRepository.findOne({
      where: { email },
      relations: ['nivel']
    });
  }

  // Función unificada para crear usuarios (Tradicional o Google)
  async crearUsuario(datos: any) {
    let nuevoId: string = "";
    let existe = true;

    // Bucle para asegurar que el ID de 5 dígitos sea único
    while (existe) {
      nuevoId = Math.floor(10000 + Math.random() * 90000).toString();
      const userExistente = await this.usuarioRepository.findOne({
        where: { idUsuario: nuevoId }
      });
      if (!userExistente) existe = false;
    }

    const nuevoUsuario = this.usuarioRepository.create({
      idUsuario: nuevoId,
      nombre: datos.nombre,
      apellido: datos.apellido || '', // Evitamos nulos si no vienen
      email: datos.email,
      password: datos.password || null, // Google no manda password
      direccion: datos.direccion || '',
      telefono: datos.telefono || '',
      idNivel: 1
    });

    return await this.usuarioRepository.save(nuevoUsuario);
  }

  // Mantenemos los métodos estándar
  async findAll() {
    return await this.usuarioRepository.find({ relations: ['nivel'] });
  }

  async findOne(id: string) {
    return await this.usuarioRepository.findOne({
      where: { idUsuario: id },
      relations: ['nivel']
    });
  }

  async update(id: string, updateUsuarioDto: any) {
    await this.usuarioRepository.update(id, updateUsuarioDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const usuario = await this.findOne(id);
    if (usuario) {
      return await this.usuarioRepository.remove(usuario);
    }
    return null;
  }
}