/**
 * Configura o Zod 4 para usar o locale em português em toda a aplicação.
 * Garante que mensagens de fallback (ex.: invalid_format para email) sejam exibidas em PT.
 * Deve ser importado uma vez no startup (ex.: layout ou ponto de entrada).
 */
import { config } from 'zod';
import { pt } from 'zod/v4/locales';

config(pt());
