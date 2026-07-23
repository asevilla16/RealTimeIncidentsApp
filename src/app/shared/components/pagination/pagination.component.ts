import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    @if (totalItems() > 0) {
    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-xs text-ink/45">
        Showing {{ rangeStart() }} to {{ rangeEnd() }} of {{ totalItems() }} results
      </p>

      <div class="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Previous page"
          class="flex h-8 w-8 items-center justify-center rounded-sm border border-ink/10 bg-white text-ink disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:outline-2 focus-visible:outline-teal"
          [disabled]="currentPage() === 1"
          (click)="previousPage()">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        @for (item of pageItems(); track $index) {
          @if (item === '...') {
            <span class="flex h-8 w-8 items-center justify-center text-sm text-ink/40">…</span>
          } @else {
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-sm border text-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-teal"
              [class.border-teal]="item === currentPage()"
              [class.bg-teal]="item === currentPage()"
              [class.text-white]="item === currentPage()"
              [class.border-ink/10]="item !== currentPage()"
              [class.bg-white]="item !== currentPage()"
              [class.text-ink]="item !== currentPage()"
              (click)="goToPage(item)">
              {{ item }}
            </button>
          }
        }

        <button
          type="button"
          aria-label="Next page"
          class="flex h-8 w-8 items-center justify-center rounded-sm border border-ink/10 bg-white text-ink disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:outline-2 focus-visible:outline-teal"
          [disabled]="currentPage() === totalPages()"
          (click)="nextPage()">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <path d="m9 18 6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </div>
    }
  `,
})
export class PaginationComponent {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  pageSize = input.required<number>();
  totalItems = input.required<number>();

  pageChange = output<number>();

  rangeStart = computed(() =>
    this.totalItems() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1,
  );

  rangeEnd = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalItems()));

  // Numbered page buttons with '...' gaps, e.g. [1, '...', 4, 5, 6, '...', 10].
  pageItems = computed<(number | '...')[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 1;

    const pages: number[] = [];
    for (let page = 1; page <= total; page++) {
      if (page === 1 || page === total || Math.abs(page - current) <= delta) {
        pages.push(page);
      }
    }

    const items: (number | '...')[] = [];
    let previous = 0;
    for (const page of pages) {
      if (previous && page - previous > 1) {
        items.push('...');
      }
      items.push(page);
      previous = page;
    }
    return items;
  });

  goToPage(page: number): void {
    this.pageChange.emit(Math.min(Math.max(1, page), this.totalPages()));
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }
}
