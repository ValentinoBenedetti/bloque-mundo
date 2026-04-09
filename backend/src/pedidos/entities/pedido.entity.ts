import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { LineaPedido } from '../../linea-pedido/entities/linea-pedido.entity';

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

    // Un usuario puede tener muchos pedidos a lo largo del tiempo
    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'idUsuario' })
    usuario: Usuario;

    // Un pedido tiene muchas líneas de detalle
    @OneToMany(() => LineaPedido, (linea) => linea.pedido, { cascade: true })
    lineas: LineaPedido[];
}