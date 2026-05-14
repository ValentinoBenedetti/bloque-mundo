import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { EnviosService } from './envios.service';
import type { EstadoEnvio } from './entities/envio.entity';

@Controller('envios')
export class EnviosController {
    constructor(private readonly enviosService: EnviosService) {}

    @Get()
    findAll() {
        return this.enviosService.findAll();
    }

    @Patch(':id/estado')
    updateEstado(
        @Param('id') id: string,
        @Body('estado') estado: EstadoEnvio
    ) {
        return this.enviosService.updateEstado(+id, estado);
    }
}
