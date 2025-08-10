import { Component, Input } from '@angular/core';
import { cn } from '../../lib/utils';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [class]="buttonClasses"
      [disabled]="disabled"
      [type]="type"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'default';
  @Input() size: ButtonSize = 'default';
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() className = '';

  get buttonClasses(): string {
    return cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      {
        // Variants
        'bg-primary text-primary-foreground hover:bg-primary/90': this.variant === 'default',
        'bg-destructive text-destructive-foreground hover:bg-destructive/90': this.variant === 'destructive',
        'border border-input bg-background hover:bg-accent hover:text-accent-foreground': this.variant === 'outline',
        'bg-secondary text-secondary-foreground hover:bg-secondary/80': this.variant === 'secondary',
        'hover:bg-accent hover:text-accent-foreground': this.variant === 'ghost',
        'text-primary underline-offset-4 hover:underline': this.variant === 'link',
        
        // Sizes
        'h-10 px-4 py-2': this.size === 'default',
        'h-9 rounded-md px-3': this.size === 'sm',
        'h-11 rounded-md px-8': this.size === 'lg',
        'h-10 w-10': this.size === 'icon',
      },
      this.className
    );
  }
}