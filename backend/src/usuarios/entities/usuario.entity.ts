import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { NivelUsuario } from './nivel-usuario.entity';

@Entity('usuarios')
export class Usuario {
    // 🔥 VOLVEMOS A LA NORMALIDAD: Texto de 5 letras
    @PrimaryColumn({ type: 'char', length: 5 })
    idUsuario: string;

    @Column({ type: 'varchar', length: 100, default: 'Coleccionista' })
    nombre: string;

    @Column({ type: 'varchar', length: 150, unique: true })
    email: string;

    @Column({ type: 'varchar' })
    password: string;

    @Column({ type: 'boolean', default: false })
    esAdmin: boolean;

    @CreateDateColumn()
    fechaRegistro: Date;

    @ManyToOne(() => NivelUsuario, (nivel) => nivel.usuarios)
    @JoinColumn({ name: 'idNivel' })
    nivel: NivelUsuario;
}