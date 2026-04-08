import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Tema } from '../../temas/entities/tema.entity';

@Entity('productos')
export class Producto {
    @PrimaryGeneratedColumn()
    idProducto: number;

    @Column({ type: 'varchar', length: 20, unique: true })
    codigoProducto: string;

    @Column({ type: 'varchar', length: 100 })
    titulo: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    rangoEdad: string;

    @Column({ type: 'int', nullable: true })
    cantidadPiezas: number;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    categoria: string;

    @Column({ type: 'boolean', default: true })
    productoOriginal: boolean;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio: number;

    @Column({ type: 'int', default: 0 })
    stock: number;

    @Column({ type: 'enum', enum: ['Publicado', 'NoPublicado'], default: 'NoPublicado' })
    estado: string;

    // Muchos Productos pertenecen a un Tema
    @ManyToOne(() => Tema, (tema) => tema.productos)
    @JoinColumn({ name: 'idTema' })
    tema: Tema;
}