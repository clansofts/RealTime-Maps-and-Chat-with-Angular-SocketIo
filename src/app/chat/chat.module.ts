import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';




import { ChatComponent} from './single/chat.component';
// import { ChatSingleComponent} from './chatSingle/chatSingle.component';
import { ChatService} from './chat.service';
import { ChatRouting} from './chatRouting.module';

import {SharedSmallModule } from '../shared/sharedSmall.module';



@NgModule({
  imports:     [
    // UserModule,
    // DragulaModule,
    SharedSmallModule,
    ChatRouting,
    // CommonModule,
    // FormsModule,

    ReactiveFormsModule,
    // PictureModule,
    // QuoteModule,
    // SharedModule

    // AutocompleteModule,
  ],
  declarations: [

    ChatComponent,
    // ChatsComponent,

    // ChatDialogComponent,
    // PictureComponent,
    // ChatSingleComponent,
    // AutocompleteComponent,
  ],
  exports:      [
    ChatComponent,
    // ChatsComponent,
    // AutocompleteComponent,
  ],
  providers:    [ ChatService ],
  entryComponents: [
    // ChatDialogComponent,
  ]
})
export class ChatModule { }
