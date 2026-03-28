'use client';

import { useState, useEffect } from 'react';
import { Accessibility, Type, X } from 'lucide-react';
import { useAccessibilityStore } from '@/hooks/use-accessibility-store';
import { Button } from '@/components/atoms/button';
import { Switch } from '@/components/atoms/switch';
import { Label } from '@/components/atoms/label';
import { Separator } from '@/components/atoms/separator';

export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { highContrast, toggleHighContrast, fontSize, setFontSize, reset } = useAccessibilityStore();

  // Prevents hydration mismatch mapping server HTML vs client JS state
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <div className="glass-darker w-80 rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold flex items-center gap-2">
              <Accessibility className="w-5 h-5" />
              Acessibilidade
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setIsOpen(false)}
              aria-label="Fechar menu de acessibilidade"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <Separator className="mb-4" />

          {/* High Contrast Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col gap-1">
              <Label htmlFor="high-contrast" className="text-sm font-medium">Alto Contraste</Label>
              <span className="text-xs text-muted-foreground">Inverte cores para máxima leitura</span>
            </div>
            <Switch
              id="high-contrast"
              checked={highContrast}
              onCheckedChange={toggleHighContrast}
            />
          </div>

          <Separator className="mb-4" />

          {/* Font Size Adjuster */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Type className="w-4 h-4" />
              Tamanho da Fonte
            </div>
            <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-xl border border-border">
              <Button
                variant={fontSize === 100 ? "default" : "ghost"}
                size="sm"
                className="flex-1 rounded-lg"
                onClick={() => setFontSize(100)}
              >
                Padrão
              </Button>
              <Button
                variant={fontSize === 112.5 ? "default" : "ghost"}
                size="sm"
                className="flex-1 rounded-lg text-base"
                onClick={() => setFontSize(112.5)}
              >
                Médio
              </Button>
              <Button
                variant={fontSize === 125 ? "default" : "ghost"}
                size="sm"
                className="flex-1 rounded-lg text-lg"
                onClick={() => setFontSize(125)}
              >
                Grande
              </Button>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={reset}
          >
            Restaurar Padrões
          </Button>
        </div>
      )}

      {/* Floating Action Button */}
      <Button
        className="h-14 w-14 rounded-full shadow-xl hover:scale-105 transition-transform duration-200"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu de Acessibilidade"
      >
        <Accessibility className="w-6 h-6" />
      </Button>
    </div>
  );
}
