import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Pedido } from '../../pedidos/entities/pedido.entity';

export type EstadoEnvio = 'Pendiente' | 'En tránsito' | 'Entregado';

@Entity('correo_argentino')
export class Envio {
    @PrimaryGeneratedColumn()
    idEnvio: number;

    @Column({ type: 'varchar', length: 10 })
    codigoPostal: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    direccion: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    costo: number;

    @Column({
        type: 'varchar',
        length: 20,
        default: 'Pendiente'
    })
    estado: EstadoEnvio;

    @OneToOne(() => Pedido, (pedido) => pedido.envio)
    @JoinColumn({ name: 'idPedido' })
    pedido: Pedido;
}
