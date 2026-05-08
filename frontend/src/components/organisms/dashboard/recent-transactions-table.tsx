"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card"
import { formatCurrency, cn } from "@/lib/utils"
import { Badge } from "@/components/atoms/badge"

interface RecentTransaction {
  id: number
  bookName: string
  date: string
  quantity: number
  totalValue: number
  profit: number
}

interface RecentTransactionsTableProps {
  transactions: RecentTransaction[]
  className?: string
}

export function RecentTransactionsTable({
  transactions,
  className,
}: RecentTransactionsTableProps) {
  return (
    <Card className={cn("bg-card border-none shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
          Últimas Transações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-semibold text-muted-foreground w-[40%]">Livro</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Data</TableHead>
                <TableHead className="font-semibold text-muted-foreground text-right">Qtd.</TableHead>
                <TableHead className="font-semibold text-muted-foreground text-right">Valor Total</TableHead>
                <TableHead className="font-semibold text-muted-foreground text-right">Lucro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id} className="border-border hover:bg-accent/50">
                    <TableCell className="font-medium">{tx.bookName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right font-mono">{tx.quantity}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(tx.totalValue)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={tx.profit >= 0 ? "secondary" : "destructive"}
                        className={cn(
                          "font-mono",
                          tx.profit >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                        )}
                      >
                        {formatCurrency(tx.profit)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
