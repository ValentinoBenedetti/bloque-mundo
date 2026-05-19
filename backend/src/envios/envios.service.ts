import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Envio, EstadoEnvio } from './entities/envio.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { MailService } from '../pedidos/mail.service';

@Injectable()
export class EnviosService {
    constructor(
        @InjectRepository(Envio)
        private envioRepository: Repository<Envio>,
        @InjectRepository(Pedido)
        private pedidoRepository: Repository<Pedido>,
        private mailService: MailService,
    ) {}

    // Traer todos los envíos con info del pedido y usuario
    async findAll() {
        return this.envioRepository.find({
            relations: ['pedido', 'pedido.usuario', 'pedido.lineas', 'pedido.lineas.producto', 'pedido.lineas.combo'],
            order: { idEnvio: 'DESC' },
        });
    }

    // Cambiar estado del envío
    async updateEstado(idEnvio: number, estado: EstadoEnvio) {
        const envio = await this.envioRepository.findOne({
            where: { idEnvio },
            relations: ['pedido', 'pedido.usuario', 'pedido.lineas', 'pedido.lineas.producto', 'pedido.lineas.combo']
        });
        if (!envio) throw new NotFoundException('Envío no encontrado');

        const estadoAnterior = envio.estado;
        if (estadoAnterior !== estado) {
            envio.estado = estado;
            const updatedEnvio = await this.envioRepository.save(envio);

            // Notificar por mail si pasa a "En camino" o "Entregado"
            if (estado === 'En camino' || estado === 'Entregado') {
                this.mailService.enviarCorreoEstadoEnvio(updatedEnvio, estadoAnterior).catch(err => {
                    console.error('[Email Envio Error]', err);
                });
            }
            return updatedEnvio;
        }
        return envio;
    }

    // Crear envío automáticamente cuando se hace un pedido
    async crearEnvio(idPedido: number, codigoPostal: string = '0000', costo: number = 0, direccion: string = '') {
        const pedido = await this.pedidoRepository.findOne({ where: { idPedido } });
        if (!pedido) throw new NotFoundException('Pedido no encontrado');

        // Verificar si ya tiene un envío
        const existente = await this.envioRepository.findOne({
            where: { pedido: { idPedido } },
        });
        if (existente) return existente;

        const envio = this.envioRepository.create({
            codigoPostal,
            direccion,
            costo,
            estado: 'Pendiente',
            pedido,
        });
        return this.envioRepository.save(envio);
    }
}
