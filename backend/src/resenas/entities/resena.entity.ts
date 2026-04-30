import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Check } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('resenas')
@Check(`"estrellas" >= 1 AND "estrellas" <= 5`)
export class Resena {
    @PrimaryGeneratedColumn()
    idResena: number;

    @Column({ type: 'text' })
    comentario: string;

    @Column({ type: 'boolean', default: true })
    esAnonima: boolean;

    @Column({ type: 'int' })
    estrellas: number;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'idUsuario' })
    usuario: Usuario;

    @ManyToOne(() => Producto)
    @JoinColumn({ name: 'idProducto' })
    producto: Producto;
}
