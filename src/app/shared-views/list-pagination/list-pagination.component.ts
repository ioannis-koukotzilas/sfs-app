import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-list-pagination',
  templateUrl: './list-pagination.component.html',
  styleUrl: './list-pagination.component.css',
})
export class ListPaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  paginate(page: number): void {
    this.pageChange.emit(page);
  }
}
