import { Component, Host, h, Prop, Event, EventEmitter } from '@stencil/core';
import { WaitingListEntry, AmbulanceDevelopersApi } from '../../api';

@Component({
  tag: 'msevcik-ambulance-wl-list',
  styleUrl: 'msevcik-ambulance-wl-list.css',
  shadow: true,
})
export class MsevcikAmbulanceWlList {

  @Prop({ attribute: "selected-entry-id", mutable: true, reflect: true})
  selectedEntryId: string

  @Prop()
  ambulance: string = "";

  @Event()
  wlEntrySelected: EventEmitter<string>;

  waitingPatients: WaitingListEntry[];

  private developerApiClient: AmbulanceDevelopersApi;

  @Prop({ attribute: "api-uri" })
  apiUri: string = null;

  async componentWillLoad() {
    this.developerApiClient = new AmbulanceDevelopersApi(undefined, this.apiUri);
    this.waitingPatients = await this.developerApiClient
      .getWaitingListEntries(this.ambulance)
      .then(_ => _.data);
  }

  private isoDateToLocale(iso:string) {
    if(!iso) return '';
    return new Date(Date.parse(iso)).toLocaleTimeString()
  }

  handleEntrySelection(entryId: string, event: CustomEvent) {
    if(event.detail.source === "interaction") { // see mwc-list for details of the request-selected event
      this.selectedEntryId = entryId;
      this.wlEntrySelected.emit(entryId);
    }
  }

  render() {
    return (
      <Host>
        <mwc-list>
          { this.waitingPatients.map( entry => 
            <mwc-list-item graphic="avatar" twoline // upravený element mwc-list-item
                           selected={entry.id === this.selectedEntryId ? true : false}
                           activated={entry.id === this.selectedEntryId ? true : false}
                           onRequest-selected={ev => this.handleEntrySelection(entry.id, ev)}>
              <span>{entry.name}</span>
              <span slot="secondary">Predpokladaný vstup: {this.isoDateToLocale(entry.estimatedStart)}</span>
              <mwc-icon slot="graphic">person</mwc-icon>
            </mwc-list-item>
          )}
        </mwc-list>
      </Host>
    );
  }
}
