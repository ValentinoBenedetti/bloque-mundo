import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cupon } from './entities/cupon.entity';
import { CreateCuponDto } from './dto/create-cupon.dto';

@Injectable()
export class CuponesService {
    constructor(
        @InjectRepository(Cupon)
        private cuponRepository: Repository<Cupon>,
    ) {}

    async create(createCuponDto: CreateCuponDto) {
        const existente = await this.cuponRepository.findOneBy({ codigo: createCuponDto.codigo });
        if (existente) {
            throw new BadRequestException('El código de cupón ya existe');
        }

        const cuponData: any = { ...createCuponDto };
        if (createCuponDto.idTemaRequerido) {
            cuponData.temaRequerido = { idTema: createCuponDto.idTemaRequerido };
        }

        const cupon = this.cuponRepository.create(cuponData);
        return this.cuponRepository.save(cupon);
    }

    findAll() {
        return this.cuponRepository.find({
            relations: ['pedidos', 'pedidos.usuario', 'temaRequerido'],
            order: { fechaInicio: 'DESC' }
        });
    }

    async findOne(codigo: string) {
        const cupon = await this.cuponRepository.findOne({
            where: { codigo },
            relations: ['pedidos', 'pedidos.usuario', 'temaRequerido']
        });
        if (!cupon) {
            throw new NotFoundException('Cupón no encontrado');
        }
        return cupon;
    }

    async validate(codigo: string, subtotal?: number, temasEnCarrito?: number[], idUsuario?: string) {
        const cupon = await this.findOne(codigo);

        if (!cupon.valido) {
            throw new BadRequestException('El cupón no es válido');
        }

        const hoy = new Date().toISOString().split('T')[0];
        if (hoy < cupon.fechaInicio || hoy > cupon.fechaFin) {
            throw new BadRequestException('El cupón ha expirado o aún no está activo');
        }

        if (cupon.topeUso > 0 && cupon.pedidos?.length >= cupon.topeUso) {
            throw new BadRequestException('El cupón ha alcanzado su límite de usos');
        }

        // Validar que el usuario no haya usado ya este cupón
        if (idUsuario) {
            const yaLoUso = cupon.pedidos?.some(
                (pedido) => pedido.usuario?.idUsuario === idUsuario
            );
            if (yaLoUso) {
                throw new BadRequestException('Ya usaste este cupón en una compra anterior');
            }
        }

        if (Number(cupon.montoMinimo) > 0 && subtotal !== undefined) {
            if (Number(subtotal) < Number(cupon.montoMinimo)) {
                throw new BadRequestException(`Para usar este cupón tu compra debe superar los $${cupon.montoMinimo}`);
            }
        }

        if (cupon.temaRequerido && temasEnCarrito !== undefined) {
            const todosPertenecenAlTema = temasEnCarrito.length > 0 && temasEnCarrito.every(
                (idTema) => idTema === cupon.temaRequerido.idTema
            );
            if (!todosPertenecenAlTema) {
                throw new BadRequestException(`El cupón solo aplica si todos los productos en el carrito pertenecen a la temática "${cupon.temaRequerido.nombre}"`);
            }
        }

        return cupon;
    }

    async remove(codigo: string) {
        const cupon = await this.findOne(codigo);
        return this.cuponRepository.remove(cupon);
    }
}
