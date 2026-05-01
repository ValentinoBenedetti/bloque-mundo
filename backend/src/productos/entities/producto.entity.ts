import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { Tema } from '../../temas/entities/tema.entity';

@Entity('productos')
export class Producto {
    // 1. Cambiamos PrimaryGeneratedColumn por PrimaryColumn (ya no es auto-incremental)
    @PrimaryColumn({ type: 'int' }) // 🔥 ESTO ES VITAL
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

    @Column({ type: 'enum', enum: ['Publicado', 'NoPublicado'], default: 'Publicado' })
    estado: string;

    @Column({ type: 'boolean', default: false })
    esDestacado: boolean;

    @Column({ type: 'boolean', default: false })
    esNovedad: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    imagen: string;

    // Muchos Productos pertenecen a un Tema
    @ManyToOne(() => Tema, (tema) => tema.productos)
    @JoinColumn({ name: 'idTema' })
    tema: Tema;

    // 2. FUNCIÓN MÁGICA: Se ejecuta justo antes de guardar en la base de datos
    @BeforeInsert()
    generarIdAleatorio() {
        // Genera un número aleatorio entre 10000 y 99999 y se lo asigna a idProducto
        this.idProducto = Math.floor(10000 + Math.random() * 90000);
    }
}