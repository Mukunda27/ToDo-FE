import { MediaMatcher, BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnInit, OnDestroy, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { ListService } from '../../list.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Output() createTask = new EventEmitter<void>();
  collapsed = false;
  newListName = '';
  mediaQuery: MediaQueryList;
  customLIsts: string[];

  constructor(
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
    breakPOintObserver: BreakpointObserver,
    private listService: ListService) {
    this.mediaQuery = media.matchMedia('(max-width: 768px)');

    breakPOintObserver.observe([
      '(max-width: 768px)'
    ]).subscribe(result => {
      this.collapsed = result.matches;
    });
  }

  ngOnInit(): void {
    this.getAllLists();
  }

  toggleCollapse() {
    console.log('toggle');
    this.collapsed = !this.collapsed;
  }

  addNewTask() {
    this.createTask.emit();
  }

  addNewLsit() {
    if (!this.newListName) {
      return;
    }

    this.listService.addList(this.newListName).subscribe(response => {
      console.log(response);
      this.getAllLists();
    }, error => {
      console.log(error);
    });
    this.newListName = '';
  }

  getAllLists() {
    this.customLIsts = [];
    this.listService.getAllLists().subscribe(response => {
      response.lists.forEach((list: { name: string; }) => {
        this.customLIsts.push(list.name);
      });
      this.listService.listUpdated.next({
        lists: [...this.customLIsts]
      });
    }, error => {
      console.log(error);
    });
  }
}
