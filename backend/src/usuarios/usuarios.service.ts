import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { NivelUsuario } from './entities/nivel-usuario.entity';
import { MailService } from '../pedidos/mail.service';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(NivelUsuario)
    private readonly nivelRepository: Repository<NivelUsuario>,
    private readonly mailService: MailService,
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

    const primerNivel = await this.nivelRepository.findOne({
      where: {},
      order: { montoMinimo: 'ASC' }
    });
    const nivelInicialId = primerNivel ? primerNivel.idNivel : 6;

    const nuevoUsuario = this.usuarioRepository.create({
      idUsuario: nuevoId,
      nombre: datos.nombre,
      apellido: datos.apellido || '', // Evitamos nulos si no vienen
      email: datos.email,
      password: datos.password || null, // Google no manda password
      direccion: datos.direccion || '',
      telefono: datos.telefono || '',
      idNivel: nivelInicialId,
      nivel: primerNivel ? primerNivel : undefined
    });

    const usuarioCreado = await this.usuarioRepository.save(nuevoUsuario);
    this.mailService.enviarCorreoRegistro(usuarioCreado).catch(err => {
      console.error('[Email Welcome Error]', err);
    });
    return usuarioCreado;
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

  async recalcularNivel(idUsuario: string) {
    // 1. Obtener el gasto total del usuario sumando sus pedidos pagados
    const result = await this.usuarioRepository.query(
      'SELECT SUM(total) as total FROM pedidos WHERE "idUsuario" = $1 AND estado = \'PAGADO\'',
      [idUsuario]
    );
    const gastoTotal = parseFloat(result[0].total || 0);

    // 2. Buscar el nivel más alto que puede alcanzar con ese gasto
    const niveles = await this.nivelRepository.find({
      order: { montoMinimo: 'ASC' } // Cambiado a ASC para buscar el siguiente nivel más facil
    });

    let nivelAlcanzado = niveles[0]; // Por defecto el primero
    let proximoNivel: NivelUsuario | null = null;

    for (let i = 0; i < niveles.length; i++) {
      if (gastoTotal >= parseFloat(niveles[i].montoMinimo as any)) {
        nivelAlcanzado = niveles[i];
      } else {
        proximoNivel = niveles[i];
        break;
      }
    }

    if (nivelAlcanzado) {
      await this.usuarioRepository.update(idUsuario, { idNivel: nivelAlcanzado.idNivel });
    }

    return {
      nivelActual: nivelAlcanzado,
      proximoNivel: proximoNivel,
      gastoTotal: gastoTotal,
      faltanteParaProximo: proximoNivel ? parseFloat(proximoNivel.montoMinimo as any) - gastoTotal : 0
    };
  }

  async getStatus(idUsuario: string) {
    return this.recalcularNivel(idUsuario);
  }
}