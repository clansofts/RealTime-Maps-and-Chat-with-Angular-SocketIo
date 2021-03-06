import { Component, OnInit, OnDestroy, Input , ViewChild, ElementRef} from '@angular/core';

import { MapService } from '../map.service';
import { Map } from '../map.model';
import { Search, PaginationData } from '../../home/home.model';
import { Project } from '../../project/project.model';
import { AuthService} from '../../auth/auth.service';
import {Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['../map.component.css'],
})
export class MapComponent implements OnInit, OnDestroy {
  @Input() search: Search = new Search()
  @ViewChild('readMap', { read: ElementRef }) public readMap: ElementRef;
  loading: boolean;
  messages = [];
  fetchedOldMaps: Map[] = []
  connection;
  message: Map = new Map();
  messageReceived: Map = new Map();
  paginationData: PaginationData = new PaginationData()

  lat: number = 51.678418;
  latMarker: number = 51.678418;
  lng: number = 7.809007;

  constructor(
    private activatedRoute: ActivatedRoute,
    private mapService: MapService,
    private authService: AuthService
  ) { }

  sendMessage() {
    console.log(this.message.chatName)
    if(this.message.chatName) {
      // if(this.search.stratId) {
      //   let newStrat = new Strat()
      //   newStrat._id = this.search.stratId
      //   this.message.strats = [newStrat]
      // }
      // if(this.search.missionId) {
      //   let newMission = new Mission()
      //   newMission._id = this.search.missionId
      //   this.message.missions = [newMission]
      // }
      if(this.search.projectId) {
        const newProject = new Project()
        newProject._id = this.search.projectId
        this.message.projects = [newProject]
      }
      // console.log(this.authService.getCurrentUser())
      this.message.users = [this.authService.getCurrentUser()]
      this.message.ownerCompanies= [this.authService.getCurrentUser().ownerCompanies[0]]
      this.mapService.sendMessage(this.message);
      this.message.chatName = '';
      // setTimeout(()=>this.readMap.nativeElement.scrollTop += 10000 , 1);


      // try {
      //     this.readMap.nativeElement.scrollTop = this.readMap.nativeElement.scrollHeight;
      // } catch(err) { }



    }
  }

  ngOnInit() {

    this.activatedRoute.params.subscribe((params: Params) => {


      if(this.connection)
        this.connection.unsubscribe();

      this.connection = this.mapService.getMessages(this.search.stratId + 'map').subscribe(message => {
        // this.messages.push(message);
        this.messageReceived = <Map>message;
        console.log(message)
        // 51.678418
        this.latMarker = Number((<Map>message).chatName)
        // console.log(this.messages.length )
        // if (this.messages.length > this.paginationData.itemsPerPage)
        //   this.messages.splice(0, 1);


      })
    })
  }

  ngAfterViewChecked() {
    this.readMap.nativeElement.scrollTop += 10000
  }








  ngOnDestroy() {
    this.connection.unsubscribe();
  }
}
