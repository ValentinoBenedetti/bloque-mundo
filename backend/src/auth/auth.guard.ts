import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        // Si no hay token, lo rebotamos
        if (!token) {
            throw new UnauthorizedException('No tenés permiso. Iniciá sesión primero.');
        }

        try {
            // Verificamos si el token es real usando nuestra palabra secreta
            const payload = await this.jwtService.verifyAsync(token, {
                secret: 'EL_SECRETO_DE_BLOQUE_MUNDO_2026',
            });

            // Guardamos los datos del usuario dentro de la petición para usar el ID después
            request['user'] = payload;
        } catch {
            // Si el token es trucho o venció, afuera
            throw new UnauthorizedException('Token inválido o expirado.');
        }
        return true;
    }

    // Función auxiliar para sacar el token del encabezado de la petición
    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}