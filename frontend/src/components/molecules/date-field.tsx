"use client"

import * as React from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/atoms/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/molecules/popover"
import { cn } from "@/lib/utils"

type DateFieldProps = Omit<
  React.ComponentProps<"input">,
  "children" | "className" | "type"
> & {
  className?: string
  label?: string
}

const weekdays = ["S", "T", "Q", "Q", "S", "S", "D"]

function parseDate(value: unknown) {
  if (typeof value !== "string" || !value) return null
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

function formatDateValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatDisplay(value: unknown) {
  const date = parseDate(value)
  if (!date) return "Selecione a data"
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

function sameDay(first: Date | null, second: Date) {
  return (
    first?.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  )
}

function buildCalendarDays(month: Date) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstDay = new Date(year, monthIndex, 1)
  const startOffset = firstDay.getDay()
  const start = new Date(year, monthIndex, 1 - startOffset)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return date
  })
}

function DateField({
  className,
  disabled,
  id,
  label,
  onChange,
  value,
  ...props
}: DateFieldProps) {
  const resolvedId = React.useId()
  const fieldId = id ?? resolvedId
  const selectedDate = React.useMemo(() => parseDate(value), [value])
  const [open, setOpen] = React.useState(false)
  const [visibleMonth, setVisibleMonth] = React.useState(
    () => selectedDate ?? new Date()
  )

  React.useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(selectedDate)
    }
  }, [selectedDate])

  const calendarDays = buildCalendarDays(visibleMonth)
  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(visibleMonth)

  function moveMonth(offset: number) {
    setVisibleMonth(
      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1)
    )
  }

  function selectDate(date: Date) {
    const nextValue = formatDateValue(date)
    onChange?.({
      target: { value: nextValue },
      currentTarget: { value: nextValue },
    } as React.ChangeEvent<HTMLInputElement>)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="group/date-field relative">
        <input
          {...props}
          aria-hidden="true"
          className="sr-only"
          disabled={disabled}
          id={fieldId}
          readOnly
          tabIndex={-1}
          type="date"
          value={typeof value === "string" ? value : ""}
        />
        <PopoverTrigger
          aria-label={label ? `Selecionar data de ${label}` : "Selecionar data"}
          className={cn(
            "date-field flex h-11 w-full min-w-0 cursor-pointer items-center rounded-lg border border-border/70 bg-card/70 pr-3 text-left font-mono text-sm tabular-nums shadow-[inset_0_1px_0_oklch(1_0_0/0.28)] transition-all duration-300 outline-none focus-visible:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30",
            className
          )}
          disabled={disabled}
          type="button"
        >
          <span className="flex h-full w-11 shrink-0 items-center justify-center rounded-l-lg border-r border-border/70 bg-muted/80 text-muted-foreground transition-colors group-focus-within/date-field:border-primary/40 group-focus-within/date-field:bg-primary/10 group-focus-within/date-field:text-primary">
            <CalendarDays className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1 px-3 text-foreground">
            {formatDisplay(value)}
          </span>
          {label ? (
            <span className="hidden shrink-0 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70 sm:block">
              {label}
            </span>
          ) : null}
        </PopoverTrigger>
      </div>
      <PopoverContent
        align="start"
        className="w-80 gap-3 border border-border/80 bg-popover/95 p-3 shadow-[0_18px_60px_oklch(0_0_0/0.24)] backdrop-blur-xl"
        sideOffset={8}
      >
        <div className="flex items-center justify-between border-b border-border/70 pb-3">
          <Button
            aria-label="Mês anterior"
            onClick={() => moveMonth(-1)}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <ChevronLeft />
          </Button>
          <div className="text-center">
            <p className="font-display text-sm font-semibold capitalize text-foreground">
              {monthLabel}
            </p>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
              Calendário
            </p>
          </div>
          <Button
            aria-label="Próximo mês"
            onClick={() => moveMonth(1)}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <ChevronRight />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekdays.map((weekday, index) => (
            <div
              className="flex h-7 items-center justify-center font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              key={`${weekday}-${index}`}
            >
              {weekday}
            </div>
          ))}
          {calendarDays.map((date) => {
            const isSelected = sameDay(selectedDate, date)
            const isCurrentMonth = date.getMonth() === visibleMonth.getMonth()
            const isToday = sameDay(new Date(), date)

            return (
              <button
                aria-pressed={isSelected}
                className={cn(
                  "flex h-9 items-center justify-center rounded-md border border-transparent font-mono text-sm tabular-nums transition-all outline-none hover:border-primary/40 hover:bg-primary/10 focus-visible:border-primary/60 focus-visible:ring-3 focus-visible:ring-primary/20",
                  !isCurrentMonth && "text-muted-foreground/35",
                  isToday &&
                    "border-secondary/70 bg-secondary/10 text-foreground ring-1 ring-secondary/25",
                  isSelected &&
                    "border-primary bg-primary text-primary-foreground shadow-[0_8px_24px_oklch(var(--primary)/0.28)] hover:bg-primary hover:text-primary-foreground"
                )}
                key={formatDateValue(date)}
                onClick={() => selectDate(date)}
                type="button"
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DateField }
