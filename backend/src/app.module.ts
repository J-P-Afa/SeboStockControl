import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { BookModule } from './modules/book/book.module';
import { GenreModule } from './modules/genre/genre.module';
import { LanguageModule } from './modules/language/language.module';
import { PublisherModule } from './modules/publisher/publisher.module';
import { ClassificacaoModule } from './modules/classificacao/classificacao.module';
import { CanalVendaModule } from './modules/canal-venda/canal-venda.module';
import { FormaPagamentoModule } from './modules/forma-pagamento/forma-pagamento.module';
import { TipoSaidaModule } from './modules/tipo-saida/tipo-saida.module';
import { StockModule } from './modules/stock/stock.module';
import { EntradaModule } from './modules/entrada/entrada.module';
import { SaidaModule } from './modules/saida/saida.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UserModule,
    BookModule,
    GenreModule,
    LanguageModule,
    PublisherModule,
    ClassificacaoModule,
    CanalVendaModule,
    FormaPagamentoModule,
    TipoSaidaModule,
    StockModule,
    EntradaModule,
    SaidaModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
