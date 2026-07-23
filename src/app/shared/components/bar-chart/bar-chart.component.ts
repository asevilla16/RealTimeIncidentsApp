import { Component, computed, input } from "@angular/core";

export interface BarDatum {
  label: string;
  value: number;
  colorClass?: string; // e.g. "bg-coral" - overrides the highlight/default coloring
}

@Component({
  selector: "app-bar-chart",
  standalone: true,
  template: `
    <div class="flex h-full min-h-40 flex-col">
      <div class="flex h-full gap-2.5 overflow-hidden">
        @for (bar of data(); track bar.label) {
          <div class="flex h-full flex-1 flex-col items-center gap-2">
            <div class="flex w-full flex-1 flex-col items-center justify-end overflow-hidden">
              <span class="stat-figure mb-1.5 text-xs font-medium text-ink/70">{{ bar.value }}</span>
              <div
                class="w-full rounded-t-[3px] transition-[height] duration-300"
                [class]="bar.colorClass ?? (bar.label === highlight() ? 'bg-amber' : 'bg-teal')"
                [style.height.%]="heightPct(bar.value)"
              ></div>
            </div>
            <span class="text-[11px] text-ink/40">{{ bar.label }}</span>
          </div>
        }
      </div>
    </div>
  `,
})
export class BarChartComponent {
  data = input.required<BarDatum[]>();
  highlight = input<string>("");

  private max = computed(() => Math.max(...this.data().map((d) => d.value), 1));

  heightPct(value: number): number {
    return Math.max((value / this.max()) * 100, 4);
  }
}
