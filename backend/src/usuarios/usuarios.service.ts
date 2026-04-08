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

  // Función para generar el ID de 5 dígitos
  private generarIdAleatorio(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  async create(createUsuarioDto: any) {
    const nuevoUsuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      idUsuario: this.generarIdAleatorio(), // Asignamos el ID manual aquí
    });
    return await this.usuarioRepository.save(nuevoUsuario);
  }

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