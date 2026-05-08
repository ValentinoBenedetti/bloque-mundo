import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Producto } from '../../productos/entities/producto.entity';
import { Combo } from '../../combos/entities/combo.entity';

@Entity('favoritos')
export class Favorito {
    @PrimaryGeneratedColumn()
    id: number;

    // 🔥 RESPETA AL USUARIO: Texto de 5 letras
    @Column({ type: 'char', length: 5 })
    usuarioId: string;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'usuarioId' })
    usuario: Usuario;

    // 🔥 RESPETA AL PRODUCTO: Número entero
    @Column({ type: 'int', nullable: true })
    productoId: number;

    @ManyToOne(() => Producto, { nullable: true })
    @JoinColumn({ name: 'productoId' })
    producto: Producto;

    @Column({ type: 'int', nullable: true })
    comboId: number;

    @ManyToOne(() => Combo, { nullable: true })
    @JoinColumn({ name: 'comboId' })
    combo: Combo;

    @CreateDateColumn({ type: 'timestamp' })
    fechaAgregado: Date;
}