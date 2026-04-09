import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { LineaCarrito } from '../../linea-carrito/entities/linea-carrito.entity';

@Entity('carritos')
export class Carrito {
    @PrimaryGeneratedColumn()
    idCarrito: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    total: number;

    // Relación 1:1 -> Un usuario tiene un único carrito activo
    @OneToOne(() => Usuario)
    @JoinColumn({ name: 'idUsuario' })
    usuario: Usuario;

    // Relación 1:N -> Un carrito tiene muchas líneas adentro
    @OneToMany(() => LineaCarrito, (linea) => linea.carrito)
    lineas: LineaCarrito[];
}