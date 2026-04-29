import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { TipoEntradaController } from './src/modules/tipo-entrada/tipo-entrada.controller';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const controller = app.get(TipoEntradaController);

  try {
    const result = await controller.create({
      descricao: 'Test Tipo',
      isDoacao: false,
      isActive: true,
    });
    console.log('Result:', result);
  } catch (err) {
    console.error('Error:', err);
  }

  await app.close();
}
bootstrap();
