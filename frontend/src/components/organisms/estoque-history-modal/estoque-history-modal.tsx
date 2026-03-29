'use client';

import { Loader2, Download } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/molecules/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';
import type { Book } from '@/types';
import { useEstoqueHistory } from '@/hooks/use-estoques';

interface EstoqueHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book | null;
}

export function EstoqueHistoryModal({ open, onOpenChange, book }: EstoqueHistoryModalProps) {
  const { data, isLoading } = useEstoqueHistory(book?.id ?? 0, { enabled: open && !!book });

  const handleExportCsv = () => {
    if (!data?.items || !book) return;

    const headers = ['Data/Hora', 'Tipo de Transação', 'Quantidade', 'Saldo Pós-Transação', 'Responsável', 'Observação'];
    const rows = data.items.map(item => [
      format(new Date(item.data), 'dd/MM/yyyy HH:mm'),
      item.tipoTransacao,
      item.quantidade,
      item.saldoPosTransacao,
      item.responsavel,
      item.observacao || ''
    ]);

    const csvContent = [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.setAttribute('download', `extrato_${book.id}_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Extrato de Movimentações (Timeline)</DialogTitle>
          <DialogDescription>
            Histórico completo de entradas e saídas do item selecionado.
          </DialogDescription>
        </DialogHeader>

        {book && (
          <div className="bg-muted/30 p-4 rounded-xl border border-border/40 grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Cód. Interno</span>
              <span className="font-medium">#{book.id}</span>
            </div>
            <div className="flex flex-col col-span-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Obra</span>
              <span className="font-medium line-clamp-1" title={book.title}>{book.title}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Estoque Atual</span>
              <span className="font-bold text-lg">{book.stock ?? 0}</span>
            </div>
          </div>
        )}

        <div className="flex justify-end mb-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={!data?.items?.length || isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        <div className="flex-1 overflow-auto border rounded-xl">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0">
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Tipo Transação</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Saldo Final</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : !data?.items || data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Nenhuma movimentação registrada para este livro.
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((item, index) => (
                  <TableRow key={index} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-sm whitespace-nowrap">
                      {format(new Date(item.data), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.quantidade > 0 ? 'default' : 'secondary'} className="text-[10px] uppercase">
                        {item.tipoTransacao}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      <span className={item.quantidade > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
                        {item.quantidade > 0 ? `+${item.quantidade}` : item.quantidade}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      {item.saldoPosTransacao}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.responsavel}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate" title={item.observacao ?? ''}>
                      {item.observacao ?? '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
