import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { NivelUsuario } from './nivel-usuario.entity';


@Entity('usuarios')
export class Usuario {
    @PrimaryColumn({ type: 'char', length: 5 })
    idUsuario: string;

    @Column({ length: 100 })
    nombre: string;

    // 🔥 NUEVO: Apellido
    @Column({ length: 100, nullable: true })
    apellido: string;

    @Column({ length: 150, unique: true })
    email: string;

    // 🔥 CLAVE PARA GOOGLE: nullable: true (porque Google no manda password)
    @Column({ nullable: true })
    password: string;

    // 🔥 NUEVO: Dirección
    @Column({ nullable: true })
    direccion: string;

    // 🔥 NUEVO: Teléfono
    @Column({ nullable: true })
    telefono: string;

    @Column({ default: false })
    esAdmin: boolean;

    @CreateDateColumn()
    fechaRegistro: Date;

    @Column({ nullable: true })
    idNivel: number;

    // 🔥 RESTAURAMOS LA RELACIÓN QUE FALTABA
    @ManyToOne(() => NivelUsuario)
    @JoinColumn({ name: 'idNivel' })
    nivel: NivelUsuario;
}