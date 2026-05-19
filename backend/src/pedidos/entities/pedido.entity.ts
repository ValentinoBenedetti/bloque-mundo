import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { LineaPedido } from '../../linea-pedido/entities/linea-pedido.entity';
import { Cupon } from '../../cupones/entities/cupon.entity';
import { Envio } from '../../envios/entities/envio.entity';

@Entity('pedidos')
export class Pedido {
    @PrimaryGeneratedColumn()
    idPedido: number;

    @CreateDateColumn() // Esto guarda la fecha y hora exacta automáticamente
    fecha: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number;

    @Column({ type: 'varchar', length: 50, default: 'PENDIENTE' }) // PENDIENTE, PAGADO, CANCELADO
    estado: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    direccionEnvio?: string;

    // Un usuario puede tener muchos pedidos a lo largo del tiempo
    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'idUsuario' })
    usuario: Usuario;

    // Un pedido tiene muchas líneas de detalle
    @OneToMany(() => LineaPedido, (linea) => linea.pedido, { cascade: true })
    lineas: LineaPedido[];

    // Relación N:1 con Cupon
    @ManyToOne(() => Cupon, (cupon) => cupon.pedidos, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'codigoCupon' })
    cupon?: Cupon;

    @OneToOne(() => Envio, (envio) => envio.pedido)
    envio: Envio;
}