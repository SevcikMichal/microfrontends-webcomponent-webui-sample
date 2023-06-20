import { Component, Host, h, Prop, Event, EventEmitter, State } from '@stencil/core';
import { WaitingListEntry, Condition, AmbulanceDevelopersApi } from '../../api';

@Component({
  tag: 'msevcik-ambulance-wl-editor',
  styleUrl: 'msevcik-ambulance-wl-editor.css',
  shadow: true,
})
export class MsevcikAmbulanceWlEditor {

  @Prop({ attribute: "entry-id"})
  entryId: string;

  @Prop()
  ambulance: string = "";

  @Event()
  wlChange: EventEmitter<WaitingListEntry>;

  @Event()
  canceled: EventEmitter<WaitingListEntry>;

  @Event()
  deleted: EventEmitter<WaitingListEntry>;

  @State()
  entry: WaitingListEntry;

  private originalSnapshot: WaitingListEntry;

  private ambulanceConditions: Condition[];

  private developerApiClient: AmbulanceDevelopersApi;

  @Prop({ attribute: "api-uri" })
  apiUri: string = null;

  private get isNewEntry() { return !this.entryId || this.entryId === "@new"}

  private patientNameEl!: HTMLInputElement;
  private patientIdEl!: HTMLInputElement;

  async componentWillLoad() {       
    this.developerApiClient = new AmbulanceDevelopersApi(undefined, this.apiUri);
    this.ambulanceConditions = await this.developerApiClient
      .getConditions(this.ambulance)
      .then( _ => _.data);

    if(this.isNewEntry) {
      // preinitialize new entry
      this.entry = {
        id: new Date().valueOf().toString(), 
        name: "",
        patientId: "",
        waitingSince: new Date().toISOString(),
        estimatedDurationMinutes: this.ambulanceConditions[0].typicalDurationMinutes, 
        condition: this.ambulanceConditions[0]
      } as WaitingListEntry
      this.entry.estimatedStart = (await this.assumedEntryDateAsync()).toISOString();
    } else {
      this.entry = await this.developerApiClient
        .getWaitingListEntry(this.ambulance, this.entryId)
        .then( _ => _.data);
    }
    // keep snapshot 
    this.originalSnapshot = this.entry;
  }

  private async assumedEntryDateAsync(): Promise<Date> {
    const entries = await this.developerApiClient
      .getWaitingListEntries(this.ambulance)
      .then( _ => _.data);

    const lastPatientOut = entries
      .map( _ => Date.parse(_.estimatedStart) + _.estimatedDurationMinutes * 60*1000)
      .reduce( (acc, value) => Math.max(acc, value), 0);

    return new Date(Math.max(Date.parse(this.entry.waitingSince), lastPatientOut));
  }

  handleSliderInput(event: Event )
  {
      // it is necessary to update state object, not only its element to 
      // ensure component will rerender
      this.entry = {
        ...this.entry, 
        estimatedDurationMinutes: +(event.target as HTMLInputElement).value
      };
      event.stopPropagation();
  }

  handleDataChange() {
    this.entry = {
      ...this.entry,
      name: this.patientNameEl.value,
      patientId: this.patientIdEl.value
    };
  }

  handleConditionChange(ev: Event) {
    // was duration manually altered? if so keep them, otherwise reflect condition preset
    const selectedValue = (ev.target as HTMLSelectElement).value;
    const newCondition = this.ambulanceConditions.find(_ => _.code === selectedValue);

    const duration 
      = this.entry.condition.typicalDurationMinutes === this.entry.estimatedDurationMinutes
      ? ( newCondition.typicalDurationMinutes || this.entry.estimatedDurationMinutes)
      : this.entry.estimatedDurationMinutes;
    // update entry
    this.entry = {
      ...this.entry,
      name: this.patientNameEl.value,
      patientId: this.patientIdEl.value,
      condition: newCondition,
      estimatedDurationMinutes: duration
    };
  }

  async handleConfirm() {
    if(this.isNewEntry) {
      await this.developerApiClient.storeWaitingListEntry(this.ambulance, this.entry);      
    } else {
      await this.developerApiClient.updateWaitingListEntry(this.ambulance, this.entryId, this.entry);
    }
    this.originalSnapshot = this.entry;
    this.wlChange.emit(this.entry);
  }

  handleCancel()
  {
    // revert changes 
    this.entry = this.originalSnapshot;
    this.canceled.emit(this.entry);
  }

  async handleDelete()
  {
    await this.developerApiClient.deleteWaitingListEntry(this.ambulance, this.entryId)
    this.deleted.emit(this.entry);
  }

  private isoDateToLocale(iso:string) {
    if(!iso) return '';
    return new Date(Date.parse(iso)).toLocaleTimeString()
  }

  render() {
    return (
      <Host>
        <mwc-textfield icon="person" 
                       label="Meno a Priezvisko"
                       ref={(el) => this.patientNameEl = el}
                       onChange={this.handleDataChange.bind(this)}
                       value={this.entry.name}>
        </mwc-textfield>
        <mwc-textfield icon="fingerprint" 
                       label="Registračné číslo pacienta"
                       ref={(el) => this.patientIdEl = el}
                       onChange={this.handleDataChange.bind(this)}
                       value={this.entry.patientId}>
        </mwc-textfield>
        <mwc-textfield icon="watch_later" disabled
                       label="Čakáte od" 
                       value={this.isoDateToLocale(this.entry?.waitingSince)}>
        </mwc-textfield>
        <mwc-textfield icon="login" disabled
                       label="Predpokladaný čas vyšetrenia" 
                       value={this.isoDateToLocale(this.entry?.estimatedStart)}>
        </mwc-textfield>
        <mwc-select icon="sick" 
                    label="Dôvod návštevy"
                    onChange={this.handleConditionChange.bind(this)}>
            { this.ambulanceConditions.map(condition => 
                <mwc-list-item value={condition.code}
                               selected={condition.code === this.entry?.condition?.code}
                >{condition.value}</mwc-list-item>
            )}
        </mwc-select>

        <div class="duration-slider">
          <span class="label">Predpokladaná doba trvania:&nbsp; </span>
          <span class="label">{this.entry.estimatedDurationMinutes}</span>
          <span class="label">&nbsp;minút</span>
          <mwc-slider discrete withTickMarks step="5" max="45"
                      value={this.entry.estimatedDurationMinutes} 
                      oninput={this.handleSliderInput.bind(this)}
                      onchange={(e) => {e.stopPropagation()}}></mwc-slider>
        </div>

        <div class="actions">
          <mwc-button id="delete"  icon="delete" 
                   label="Zmazať"
                   disabled={ this.isNewEntry}
                   onClick={this.handleDelete.bind(this)}>
            </mwc-button>
        <span class="stretch-fill"></span>
          <mwc-button id="cancel" 
                   label="Zrušiť"
                   onClick={this.handleCancel.bind(this)}> 
          </mwc-button>
          <mwc-button id="confirm" icon="save" 
                   label="Uložit"
                   disabled={ ! this.entry?.patientId}
                   onClick={this.handleConfirm.bind(this)}> 
          </mwc-button>
        </div>
      </Host>
    );
  } 
}
